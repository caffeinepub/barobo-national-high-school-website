import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Nat "mo:core/Nat";
import Nat16 "mo:core/Nat16";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type AdminPermission = {
    #ManageBanners;
    #ManageSlider;
    #ManageHymn;
    #ManageHeritage;
    #ManageCitizenCharter;
    #ManageAlumni;
    #ManageClubs;
    #ManageResources;
    #ManageFooter;
  };

  public type AdminUserData = {
    principal : Principal;
    name : Text;
    email : Text;
    permissions : [AdminPermission];
    isActive : Bool;
    createdAt : Int;
    lastLogin : ?Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let adminUsers = Map.empty<Principal, AdminUserData>();

  var superAdminPrincipal : ?Principal = null;
  var isInitialized : Bool = false;

  var accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func initializeSuperAdmin() : async Principal {
    if (isInitialized) {
      Runtime.trap(
        "Unauthorized: Super Admin is already initialized. Use recoverSuperAdmin if you are the registered Super Admin."
      );
    };

    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous caller cannot be set as Super Admin.");
    };

    superAdminPrincipal := ?caller;
    AccessControl.initialize(accessControlState, caller, "", "");
    isInitialized := true;

    let superAdminProfile : UserProfile = {
      name = "Super Admin";
      email = "";
      role = "SuperAdmin";
    };
    userProfiles.add(caller, superAdminProfile);

    caller;
  };

  public shared ({ caller }) func recoverSuperAdmin() : async Text {
    if (not isInitialized) {
      Runtime.trap(
        "Unauthorized: Super Admin is not initialized. Use initializeSuperAdmin first."
      );
    };

    switch (superAdminPrincipal) {
      case (null) {
        Runtime.trap("Internal Error: Super Admin principal is null despite initialization flag being true.");
      };
      case (?superAdmin) {
        if (not Principal.equal(caller, superAdmin)) {
          Runtime.trap("Unauthorized: Only the registered Super Admin can recover access.");
        };
        "Super Admin access confirmed for principal: " # caller.toText();
      };
    };
  };

  func requireInitialized() {
    if (not isInitialized) {
      Runtime.trap(
        "System Error: Super Admin must be initialized first. Please contact the system administrator."
      );
    };
  };

  func isSuperAdmin(caller : Principal) : Bool {
    switch (superAdminPrincipal) {
      case (null) { false };
      case (?superAdmin) { Principal.equal(caller, superAdmin) };
    };
  };

  func isAdminUser(caller : Principal) : Bool {
    switch (adminUsers.get(caller)) {
      case (null) { false };
      case (?adminData) { adminData.isActive };
    };
  };

  func hasPermission(caller : Principal, permission : AdminPermission) : Bool {
    if (isSuperAdmin(caller)) {
      true;
    } else {
      switch (adminUsers.get(caller)) {
        case (null) { false };
        case (?adminData) {
          if (not adminData.isActive) { return false };
          adminData.permissions.find(func(p) { p == permission }) != null;
        };
      };
    };
  };

  func isAnyAdmin(caller : Principal) : Bool {
    isSuperAdmin(caller) or isAdminUser(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireInitialized();
    if (caller != user and not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createAdminUser(
    userPrincipal : Principal,
    name : Text,
    email : Text,
    permissions : [AdminPermission]
  ) : async () {
    requireInitialized();
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can create Admin Users");
    };

    if (userPrincipal.isAnonymous()) {
      Runtime.trap("Invalid principal: Cannot create admin for anonymous principal");
    };

    let adminData : AdminUserData = {
      principal = userPrincipal;
      name;
      email;
      permissions;
      isActive = true;
      createdAt = Time.now();
      lastLogin = null;
    };

    adminUsers.add(userPrincipal, adminData);
    AccessControl.assignRole(accessControlState, caller, userPrincipal, #admin);

    let adminProfile : UserProfile = {
      name;
      email;
      role = "AdminUser";
    };
    userProfiles.add(userPrincipal, adminProfile);
  };

  public shared ({ caller }) func updateAdminUserPermissions(
    userPrincipal : Principal,
    permissions : [AdminPermission]
  ) : async () {
    requireInitialized();
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can update Admin User permissions");
    };

    switch (adminUsers.get(userPrincipal)) {
      case (null) { Runtime.trap("Admin User not found") };
      case (?adminData) {
        let updatedData = {
          adminData with
          permissions;
        };
        adminUsers.add(userPrincipal, updatedData);
      };
    };
  };

  public shared ({ caller }) func setAdminUserStatus(
    userPrincipal : Principal,
    isActive : Bool
  ) : async () {
    requireInitialized();
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can change Admin User status");
    };

    switch (adminUsers.get(userPrincipal)) {
      case (null) { Runtime.trap("Admin User not found") };
      case (?adminData) {
        let updatedData = {
          adminData with
          isActive;
        };
        adminUsers.add(userPrincipal, updatedData);
      };
    };
  };

  public shared ({ caller }) func deleteAdminUser(userPrincipal : Principal) : async () {
    requireInitialized();
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can delete Admin Users");
    };

    adminUsers.remove(userPrincipal);
    userProfiles.remove(userPrincipal);
  };

  public query ({ caller }) func getAllAdminUsers() : async [AdminUserData] {
    requireInitialized();
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can view all Admin Users");
    };
    adminUsers.values().toArray();
  };

  public query ({ caller }) func getAdminUser(
    userPrincipal : Principal
  ) : async AdminUserData {
    requireInitialized();
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Super Admin can view Admin User details");
    };
    switch (adminUsers.get(userPrincipal)) {
      case (null) { Runtime.trap("Admin User not found") };
      case (?adminData) { adminData };
    };
  };

  public query ({ caller }) func getCallerRole() : async Text {
    if (isSuperAdmin(caller)) {
      return "SuperAdmin";
    };
    if (isAdminUser(caller)) {
      return "AdminUser";
    };
    if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      return "User";
    };
    "Guest";
  };

  public query ({ caller }) func getCallerPermissions() : async [AdminPermission] {
    if (isSuperAdmin(caller)) {
      return [
        #ManageBanners,
        #ManageSlider,
        #ManageHymn,
        #ManageHeritage,
        #ManageCitizenCharter,
        #ManageAlumni,
        #ManageClubs,
        #ManageResources,
        #ManageFooter
      ];
    };

    switch (adminUsers.get(caller)) {
      case (null) { [] };
      case (?adminData) {
        if (adminData.isActive) {
          adminData.permissions;
        } else {
          [];
        };
      };
    };
  };

  public type VisitorRecord = {
    timestamp : Int;
    sessionId : Text;
  };

  public type LoginRecord = {
    principal : Principal;
    timestamp : Int;
    role : Text;
  };

  public type AnalyticsPeriod = {
    daily : Nat;
    weekly : Nat;
    monthly : Nat;
    yearly : Nat;
  };

  let visitorRecords = Map.empty<Text, VisitorRecord>();
  let loginRecords = Map.empty<Int, LoginRecord>();
  var totalVisitors : Nat = 0;
  var nextLoginRecordId : Int = 0;

  let visitorRateLimit = Map.empty<Text, Int>();
  let rateLimitWindowNanos : Int = 60_000_000_000;

  public shared func recordVisitor(sessionId : Text) : async () {
    let now = Time.now();

    switch (visitorRateLimit.get(sessionId)) {
      case (?lastRecordTime) {
        if (now - lastRecordTime < rateLimitWindowNanos) {
          return;
        };
      };
      case (null) {};
    };

    let record : VisitorRecord = {
      timestamp = now;
      sessionId;
    };

    if (not visitorRecords.containsKey(sessionId)) {
      totalVisitors += 1;
    };

    visitorRecords.add(sessionId, record);
    visitorRateLimit.add(sessionId, now);
  };

  public shared ({ caller }) func recordLogin() : async () {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      return;
    };

    let role = if (isSuperAdmin(caller)) { "SuperAdmin" } else { "AdminUser" };
    let record : LoginRecord = {
      principal = caller;
      timestamp = Time.now();
      role;
    };

    loginRecords.add(nextLoginRecordId, record);
    nextLoginRecordId += 1;

    if (not isSuperAdmin(caller)) {
      switch (adminUsers.get(caller)) {
        case (null) {};
        case (?adminData) {
          let updatedData = {
            adminData with
            lastLogin = ?Time.now();
          };
          adminUsers.add(caller, updatedData);
        };
      };
    };
  };

  public query func getTotalVisitors() : async Nat {
    totalVisitors;
  };

  func countRecordsInPeriod(records : [(Text, VisitorRecord)], periodNanos : Int) : Nat {
    let now = Time.now();
    let cutoff = now - periodNanos;
    var count = 0;
    for ((_, record) in records.values()) {
      if (record.timestamp >= cutoff) {
        count += 1;
      };
    };
    count;
  };

  func countLoginRecordsInPeriod(records : [(Int, LoginRecord)], periodNanos : Int) : Nat {
    let now = Time.now();
    let cutoff = now - periodNanos;
    var count = 0;
    for ((_, record) in records.values()) {
      if (record.timestamp >= cutoff) {
        count += 1;
      };
    };
    count;
  };

  public query ({ caller }) func getVisitorAnalytics() : async AnalyticsPeriod {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    let records = visitorRecords.entries().toArray();
    let dayNanos = 24 * 60 * 60 * 1_000_000_000;

    {
      daily = countRecordsInPeriod(records, dayNanos);
      weekly = countRecordsInPeriod(records, 7 * dayNanos);
      monthly = countRecordsInPeriod(records, 30 * dayNanos);
      yearly = countRecordsInPeriod(records, 365 * dayNanos);
    };
  };

  public query ({ caller }) func getLoginAnalytics() : async AnalyticsPeriod {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    let records = loginRecords.entries().toArray();
    let dayNanos = 24 * 60 * 60 * 1_000_000_000;

    {
      daily = countLoginRecordsInPeriod(records, dayNanos);
      weekly = countLoginRecordsInPeriod(records, 7 * dayNanos);
      monthly = countLoginRecordsInPeriod(records, 30 * dayNanos);
      yearly = countLoginRecordsInPeriod(records, 365 * dayNanos);
    };
  };

  public query ({ caller }) func getRecentLoginRecords(limit : Nat) : async [LoginRecord] {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view login records");
    };

    let allRecords = loginRecords.values().toArray();
    if (allRecords.isEmpty()) { return [] };
    let sorted = allRecords.sort(
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater } else { #equal };
      }
    );

    let takeCount = if (sorted.size() < limit) { sorted.size() } else { limit };
    Array.tabulate<LoginRecord>(takeCount, func(i) { sorted[i] });
  };

  public type StorageStats = {
    totalCapacity : Nat;
    usedSpace : Nat;
    availableSpace : Nat;
    fileCount : Nat;
    lastUpdated : Int;
  };

  public type FileTypeBreakdown = {
    images : Nat;
    videos : Nat;
    documents : Nat;
  };

  var storageUsed : Nat = 0;
  var fileCount : Nat = 0;
  var imageStorage : Nat = 0;
  var videoStorage : Nat = 0;
  var documentStorage : Nat = 0;

  func updateStorageStats(fileSize : Nat, fileType : Text) {
    storageUsed += fileSize;
    fileCount += 1;

    if (fileType == "image") {
      imageStorage += fileSize;
    } else if (fileType == "video") {
      videoStorage += fileSize;
    } else {
      documentStorage += fileSize;
    };
  };

  func decreaseStorageStats(fileSize : Nat, fileType : Text) {
    if (storageUsed >= fileSize) {
      storageUsed -= fileSize;
    } else {
      storageUsed := 0;
    };

    if (fileCount > 0) {
      fileCount -= 1;
    };

    if (fileType == "image" and imageStorage >= fileSize) {
      imageStorage -= fileSize;
    } else if (fileType == "video" and videoStorage >= fileSize) {
      videoStorage -= fileSize;
    } else if (documentStorage >= fileSize) {
      documentStorage -= fileSize;
    };
  };

  public query ({ caller }) func getStorageStats() : async StorageStats {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view storage statistics");
    };

    let totalCapacity = 2_000_000_000 : Nat;
    let availableSpace = if (totalCapacity > storageUsed) {
      totalCapacity - storageUsed;
    } else {
      0;
    };

    {
      totalCapacity;
      usedSpace = storageUsed;
      availableSpace;
      fileCount;
      lastUpdated = Time.now();
    };
  };

  public query ({ caller }) func getFileTypeBreakdown() : async FileTypeBreakdown {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view file type breakdown");
    };

    {
      images = imageStorage;
      videos = videoStorage;
      documents = documentStorage;
    };
  };

  public type BannerFileMetadata = {
    id : Nat;
    file : Storage.ExternalBlob;
    isAnimated : Bool;
  };

  public type BannerImage = {
    id : Nat;
    image : BannerImageSource;
    title : Text;
    description : Text;
    isActive : Bool;
    timestamp : Int;
  };

  public type BannerImageSource = {
    #file : BannerFileMetadata;
    #url : Text;
  };

  var nextBannerId : Nat = 0;

  func getNextBannerId() : Nat {
    let currentId = nextBannerId;
    nextBannerId += 1;
    currentId;
  };

  let banners = Map.empty<Nat, BannerImage>();
  var bannerVersion = 0;

  public shared ({ caller }) func addBannerImage(
    image : BannerImageSource,
    title : Text,
    description : Text,
  ) : async BannerImage {
    requireInitialized();
    if (not hasPermission(caller, #ManageBanners)) {
      Runtime.trap("Unauthorized: You need ManageBanners permission");
    };

    let id = getNextBannerId();
    let newBanner : BannerImage = {
      id;
      image;
      title;
      description;
      isActive = false;
      timestamp = Time.now();
    };
    banners.add(id, newBanner);
    bannerVersion += 1;
    newBanner;
  };

  public shared ({ caller }) func activateBanner(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageBanners)) {
      Runtime.trap("Unauthorized: You need ManageBanners permission");
    };
    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?banner) {
        let updatedBanner = { banner with isActive = true };
        banners.add(id, updatedBanner);
        bannerVersion += 1;
      };
    };
  };

  public shared ({ caller }) func deactivateBanner(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageBanners)) {
      Runtime.trap("Unauthorized: You need ManageBanners permission");
    };
    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?banner) {
        let updatedBanner = { banner with isActive = false };
        banners.add(id, updatedBanner);
        bannerVersion += 1;
      };
    };
  };

  public query func getAllBanners() : async [BannerImage] {
    if (banners.isEmpty()) { Runtime.trap("No banners found. Please add at least one banner first!") };
    banners.values().toArray();
  };

  public query func getActiveBanners() : async [BannerImage] {
    let activeBanners = banners.values().toArray().filter(func(banner) { banner.isActive });
    if (activeBanners.isEmpty()) {
      Runtime.trap("No active banners found. Please add and activate at least one banner first!");
    };
    activeBanners;
  };

  public query func getBannerVersion() : async Nat {
    bannerVersion;
  };

  public query func getBannerById(id : Nat) : async BannerImage {
    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?banner) { banner };
    };
  };

  public shared ({ caller }) func deleteBanner(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageBanners)) {
      Runtime.trap("Unauthorized: You need ManageBanners permission");
    };
    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?_) {
        banners.remove(id);
        bannerVersion += 1;
      };
    };
  };

  public shared ({ caller }) func updateBannerImage(
    id : Nat,
    image : BannerImageSource,
    title : Text,
    description : Text
  ) : async BannerImage {
    requireInitialized();
    if (not hasPermission(caller, #ManageBanners)) {
      Runtime.trap("Unauthorized: You need ManageBanners permission");
    };

    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?existingBanner) {
        let updatedBanner : BannerImage = {
          existingBanner with
          image;
          title;
          description;
          timestamp = Time.now();
        };
        banners.add(id, updatedBanner);
        bannerVersion += 1;
        updatedBanner;
      };
    };
  };

  func getMostRecentBanner(banners : [BannerImage]) : BannerImage {
    if (banners.isEmpty()) {
      Runtime.trap("No banners found. Please add at least one banner first!");
    };
    banners.values().foldLeft(
      banners[0],
      func(current, banner) {
        if (banner.timestamp > current.timestamp) { banner } else { current };
      },
    );
  };

  public query func getLastActiveBanner() : async BannerImage {
    let activeBanners = banners.values().toArray().filter(func(banner) { banner.isActive });
    if (activeBanners.isEmpty()) {
      Runtime.trap("No active banners found. Please add and activate at least one banner first!");
    };
    getMostRecentBanner(activeBanners);
  };

  public query func getCurrentBanner() : async BannerImage {
    let allBanners = banners.values().toArray();
    if (allBanners.isEmpty()) { Runtime.trap("No banners found. Please add at least one banner first!") };
    getMostRecentBanner(allBanners);
  };

  public type ClubOrganization = {
    id : Nat;
    name : Text;
    description : Text;
    members : [Text];
    activities : [Text];
  };

  let clubsAndOrganizations = Map.empty<Nat, ClubOrganization>();

  public shared ({ caller }) func createClubOrganization(
    name : Text,
    description : Text,
    members : [Text],
    activities : [Text]
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageClubs)) {
      Runtime.trap("Unauthorized: You need ManageClubs permission");
    };
    let id = clubsAndOrganizations.size() + 1;
    let newClub : ClubOrganization = {
      id;
      name;
      description;
      members;
      activities;
    };
    clubsAndOrganizations.add(id, newClub);
  };

  public query func getClubOrganizations() : async [ClubOrganization] {
    clubsAndOrganizations.values().toArray();
  };

  public query func getClubOrganization(id : Nat) : async ClubOrganization {
    switch (clubsAndOrganizations.get(id)) {
      case (null) { Runtime.trap("Club not found") };
      case (?club) { club };
    };
  };

  public shared ({ caller }) func updateClubOrganization(
    id : Nat,
    name : Text,
    description : Text,
    members : [Text],
    activities : [Text]
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageClubs)) {
      Runtime.trap("Unauthorized: You need ManageClubs permission");
    };
    switch (clubsAndOrganizations.get(id)) {
      case (null) { Runtime.trap("Club not found") };
      case (?_club) {
        let updatedClub : ClubOrganization = {
          id;
          name;
          description;
          members;
          activities;
        };
        clubsAndOrganizations.add(id, updatedClub);
      };
    };
  };

  public shared ({ caller }) func deleteClubOrganization(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageClubs)) {
      Runtime.trap("Unauthorized: You need ManageClubs permission");
    };
    switch (clubsAndOrganizations.get(id)) {
      case (null) { Runtime.trap("Club not found") };
      case (?_) { clubsAndOrganizations.remove(id) };
    };
  };

  public type SliderImage = {
    id : Nat;
    image : SliderImageSource;
    title : Text;
    description : Text;
    displayOrder : Nat;
    timestamp : Int;
  };

  public type SliderImageSource = {
    #file : BannerFileMetadata;
    #url : Text;
  };

  let sliderImages = Map.empty<Nat, SliderImage>();
  var nextSliderId = 0;

  public shared ({ caller }) func addSliderImage(
    image : SliderImageSource,
    title : Text,
    description : Text
  ) : async Nat {
    requireInitialized();
    if (not hasPermission(caller, #ManageSlider)) {
      Runtime.trap("Unauthorized: You need ManageSlider permission");
    };

    let id = nextSliderId;
    nextSliderId += 1;
    let sliderImage : SliderImage = {
      id;
      image;
      title;
      description;
      displayOrder = id;
      timestamp = Time.now();
    };
    sliderImages.add(id, sliderImage);
    id;
  };

  public shared ({ caller }) func updateSliderImage(
    id : Nat,
    image : SliderImageSource,
    title : Text,
    description : Text,
    displayOrder : Nat
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageSlider)) {
      Runtime.trap("Unauthorized: You need ManageSlider permission");
    };

    let current = switch (sliderImages.get(id)) {
      case (null) { Runtime.trap("Slider image not found. Please check the id and try again.") };
      case (?image) { image };
    };

    let updated = {
      id;
      image;
      title;
      description;
      displayOrder;
      timestamp = Time.now();
    };

    sliderImages.add(id, updated);
  };

  public shared ({ caller }) func deleteSliderImage(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageSlider)) {
      Runtime.trap("Unauthorized: You need ManageSlider permission");
    };
    if (not sliderImages.containsKey(id)) {
      Runtime.trap("Slider image not found. Please check the id and try again.");
    };
    sliderImages.remove(id);
  };

  public query func getSliderImage(id : Nat) : async SliderImage {
    switch (sliderImages.get(id)) {
      case (null) { Runtime.trap("Slider image not found. Please check the id and try again.") };
      case (?img) { img };
    };
  };

  public query func getAllSliderImages() : async [SliderImage] {
    sliderImages.values().toArray();
  };

  public shared ({ caller }) func reorderSliderImages(newOrder : [Nat]) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageSlider)) {
      Runtime.trap("Unauthorized: You need ManageSlider permission");
    };

    for (id in newOrder.values()) {
      if (not sliderImages.containsKey(id)) {
        Runtime.trap("Invalid slider image id in new order. Please check the array and try again.");
      };
    };

    for (i in newOrder.keys()) {
      let id = newOrder[i];
      switch (sliderImages.get(id)) {
        case (null) { Runtime.trap("Slider image not found for update") };
        case (?sliderImage) {
          let updatedSliderImage = { sliderImage with displayOrder = i };
          sliderImages.add(id, updatedSliderImage);
        };
      };
    };

    let sortedImages = sliderImages.values().toArray();
    if (sortedImages.isEmpty()) {
      Runtime.trap("Internal error: Sorted images array is empty. Please try again later.");
    };
    var displayOrder = 0;
    let sortedIter = sortedImages.values();
    for (si in sortedIter) {
      let updatedSliderImage = { si with displayOrder };
      sliderImages.add(updatedSliderImage.id, updatedSliderImage);
      displayOrder += 1;
    };
  };

  public shared ({ caller }) func swapSliderImages(id1 : Nat, id2 : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageSlider)) {
      Runtime.trap("Unauthorized: You need ManageSlider permission");
    };

    switch (sliderImages.get(id1)) {
      case (null) { Runtime.trap("Slider image not found for id1. Please check the id and try again.") };
      case (?img1) {
        switch (sliderImages.get(id2)) {
          case (null) { Runtime.trap("Slider image not found for id2. Please check the id and try again.") };
          case (?img2) {
            let tempOrder = img1.displayOrder;
            let updatedSort1 = { img1 with displayOrder = img2.displayOrder };
            let updatedSort2 = { img2 with displayOrder = tempOrder };
            sliderImages.add(img1.id, updatedSort1);
            sliderImages.add(img2.id, updatedSort2);
          };
        };
      };
    };

    let sortedImages = sliderImages.values().toArray();
    if (sortedImages.isEmpty()) {
      Runtime.trap("Internal error: Sorted images array is empty. Please try again later.");
    };
    var displayOrder = 0;
    let sortedIter = sortedImages.values();
    for (si in sortedIter) {
      let updatedSliderImage = { si with displayOrder };
      sliderImages.add(updatedSliderImage.id, updatedSliderImage);
      displayOrder += 1;
    };
  };

  public query (_) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func proxyPublicImage(imageUrl : Text, extraHeaders : [OutCall.Header]) : async Text {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can use the proxy endpoint to prevent abuse");
    };
    await OutCall.httpGetRequest(imageUrl, extraHeaders, transform);
  };

  public type TextAlignment = {
    #left;
    #center;
    #right;
    #justify;
  };

  public type FontStyle = {
    #normal;
    #bold;
    #italic;
    #underline;
  };

  public type FormattedText = {
    content : Text;
    alignment : TextAlignment;
    fontSize : Nat16;
    fontStyle : FontStyle;
  };

  public type HeritageSectionContent = {
    title : Text;
    formattedText : FormattedText;
    backgroundImage : ?Storage.ExternalBlob;
    lastUpdated : Int;
    orgChartBackground : ?Storage.ExternalBlob;
  };

  public type OrganizationalStructureContent = {
    titleBackground : ?Storage.ExternalBlob;
    staticImage : ?Storage.ExternalBlob;
    lastUpdated : Int;
  };

  var heritageSection : ?HeritageSectionContent = null;
  let historyBackgroundImages = Map.empty<Int, Storage.ExternalBlob>();
  var organizationalStructure : ?OrganizationalStructureContent = null;

  public shared ({ caller }) func updateHeritageSection(
    title : Text,
    formattedText : FormattedText
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    let newContent = {
      title;
      formattedText;
      backgroundImage = switch (heritageSection) {
        case (null) { null };
        case (?current) { current.backgroundImage };
      };
      lastUpdated = Time.now();
      orgChartBackground = switch (heritageSection) {
        case (null) { null };
        case (?current) { current.orgChartBackground };
      };
    };
    heritageSection := ?newContent;
  };

  public shared ({ caller }) func setHistoryBackgroundImage(
    backgroundImage : Storage.ExternalBlob
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    switch (heritageSection) {
      case (null) {
        Runtime.trap("No content found in the History Section. Please update the content first!");
      };
      case (?current) {
        let updatedHistory = {
          current with
          backgroundImage = ?backgroundImage;
          lastUpdated = Time.now();
        };
        heritageSection := ?updatedHistory;
        historyBackgroundImages.add(updatedHistory.lastUpdated, backgroundImage);
      };
    };
  };

  public shared ({ caller }) func removeHistoryBackgroundImage() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    switch (heritageSection) {
      case (null) { Runtime.trap("No content found in the Heritage Section to update!") };
      case (?current) {
        let updatedHistory = {
          current with
          backgroundImage = null;
        };
        heritageSection := ?updatedHistory;
      };
    };
  };

  public shared ({ caller }) func setOrganizationalChartBackground(
    orgChartBackground : Storage.ExternalBlob
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    switch (heritageSection) {
      case (null) {
        Runtime.trap("No content found in the Heritage Section. Please update the content first!");
      };
      case (?current) {
        let updatedContent = {
          current with
          orgChartBackground = ?orgChartBackground;
          lastUpdated = Time.now();
        };
        heritageSection := ?updatedContent;
      };
    };
  };

  public shared ({ caller }) func removeOrganizationalChartBackground() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    switch (heritageSection) {
      case (null) { Runtime.trap("No content found in the Heritage Section to update!") };
      case (?current) {
        let updatedContent = {
          current with
          orgChartBackground = null;
        };
        heritageSection := ?updatedContent;
      };
    };
  };

  public shared ({ caller }) func setOrganizationalStructureTitleBackground(
    titleBackground : Storage.ExternalBlob
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    let updatedContent = {
      titleBackground = ?titleBackground;
      staticImage = switch (organizationalStructure) {
        case (null) { null };
        case (?current) { current.staticImage };
      };
      lastUpdated = Time.now();
    };
    organizationalStructure := ?updatedContent;
  };

  public shared ({ caller }) func removeOrganizationalStructureTitleBackground() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    switch (organizationalStructure) {
      case (null) { Runtime.trap("No organizational structure content found to update!") };
      case (?current) {
        let updatedContent = {
          current with
          titleBackground = null;
          lastUpdated = Time.now();
        };
        organizationalStructure := ?updatedContent;
      };
    };
  };

  public shared ({ caller }) func setOrganizationalStructureStaticImage(
    staticImage : Storage.ExternalBlob
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    let updatedContent = {
      titleBackground = switch (organizationalStructure) {
        case (null) { null };
        case (?current) { current.titleBackground };
      };
      staticImage = ?staticImage;
      lastUpdated = Time.now();
    };
    organizationalStructure := ?updatedContent;
  };

  public shared ({ caller }) func removeOrganizationalStructureStaticImage() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHeritage)) {
      Runtime.trap("Unauthorized: You need ManageHeritage permission");
    };
    switch (organizationalStructure) {
      case (null) { Runtime.trap("No organizational structure content found to update!") };
      case (?current) {
        let updatedContent = {
          current with
          staticImage = null;
          lastUpdated = Time.now();
        };
        organizationalStructure := ?updatedContent;
      };
    };
  };

  public query func getHeritageSection() : async HeritageSectionContent {
    switch (heritageSection) {
      case (null) {
        Runtime.trap("No content found in the Heritage Section. Please add content first!");
      };
      case (?section) { section };
    };
  };

  public query func getOrganizationalStructure() : async OrganizationalStructureContent {
    switch (organizationalStructure) {
      case (null) {
        {
          titleBackground = null;
          staticImage = null;
          lastUpdated = Time.now();
        };
      };
      case (?content) { content };
    };
  };

  public query ({ caller }) func getHistoryBackgroundImage(timestamp : Int) : async ?Storage.ExternalBlob {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access historical background images");
    };
    historyBackgroundImages.get(timestamp);
  };

  public query ({ caller }) func getHistoryBackgroundImageById(
    timestamp : Int,
  ) : async Storage.ExternalBlob {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access historical background images");
    };
    switch (historyBackgroundImages.get(timestamp)) {
      case (null) { Runtime.trap("Background image not found for the specified timestamp") };
      case (?blob) { blob };
    };
  };

  public type BNHSHymnContent = {
    video : Storage.ExternalBlob;
    lastUpdated : Int;
  };

  var bnhsHymnContent : ?BNHSHymnContent = null;

  public shared ({ caller }) func setBNHSHymn(videoFile : Storage.ExternalBlob) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHymn)) {
      Runtime.trap("Unauthorized: You need ManageHymn permission");
    };
    let content : BNHSHymnContent = {
      video = videoFile;
      lastUpdated = Time.now();
    };
    bnhsHymnContent := ?content;
  };

  public shared ({ caller }) func removeBNHSHymn() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageHymn)) {
      Runtime.trap("Unauthorized: You need ManageHymn permission");
    };
    bnhsHymnContent := null;
  };

  public query func getBNHSHymnVideo() : async Storage.ExternalBlob {
    switch (bnhsHymnContent) {
      case (null) { Runtime.trap("BNHS Hymn video not found!") };
      case (?content) { content.video };
    };
  };

  public query func getBNHSHymnMetadata() : async BNHSHymnContent {
    switch (bnhsHymnContent) {
      case (null) { Runtime.trap("No BNHS Hymn content found.") };
      case (?content) { content };
    };
  };

  public type CitizenCharterBackground = {
    backgroundImage : ?Storage.ExternalBlob;
    isActive : Bool;
    lastUpdated : Int;
  };

  var citizenCharterBackground : ?CitizenCharterBackground = null;
  let citizenCharterBackgroundImages = Map.empty<Int, Storage.ExternalBlob>();

  public type CitizenCharterStaticImage = {
    staticImage : ?Storage.ExternalBlob;
    lastUpdated : Int;
  };

  var citizenCharterStaticImage : ?CitizenCharterStaticImage = null;
  let citizenCharterStaticImages = Map.empty<Int, Storage.ExternalBlob>();

  public type CitizenCharterContactInfo = {
    title : Text;
    schoolAddress : Text;
    contactInfo : Text;
    officeHours : Text;
    schoolHours : Text;
    lastUpdated : Int;
  };

  var citizenCharterContactInfo : ?CitizenCharterContactInfo = null;

  public shared ({ caller }) func setCitizenCharterBackgroundImage(
    backgroundImage : Storage.ExternalBlob
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };
    let updatedBackground = {
      backgroundImage = ?backgroundImage;
      isActive = true;
      lastUpdated = Time.now();
    };
    citizenCharterBackground := ?updatedBackground;
    citizenCharterBackgroundImages.add(updatedBackground.lastUpdated, backgroundImage);
  };

  public shared ({ caller }) func removeCitizenCharterBackgroundImage() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };
    let updatedBackground = {
      backgroundImage = null;
      isActive = false;
      lastUpdated = Time.now();
    };
    citizenCharterBackground := ?updatedBackground;
  };

  public query func getCitizenCharterBackground() : async CitizenCharterBackground {
    switch (citizenCharterBackground) {
      case (null) {
        Runtime.trap("No background found for the Citizen Charter. Please set a background image or use the default maroon color!");
      };
      case (?background) { background };
    };
  };

  public query ({ caller }) func getCitizenCharterBackgroundImage(
    timestamp : Int
  ) : async ?Storage.ExternalBlob {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access historical background images");
    };
    citizenCharterBackgroundImages.get(timestamp);
  };

  public query ({ caller }) func getCitizenCharterBackgroundImageById(
    timestamp : Int
  ) : async Storage.ExternalBlob {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access historical background images");
    };
    switch (citizenCharterBackgroundImages.get(timestamp)) {
      case (null) { Runtime.trap("Background image not found for the specified timestamp") };
      case (?blob) { blob };
    };
  };

  public shared ({ caller }) func setCitizenCharterStaticImage(
    staticImage : Storage.ExternalBlob
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };
    let updatedStaticImage = {
      staticImage = ?staticImage;
      lastUpdated = Time.now();
    };
    citizenCharterStaticImage := ?updatedStaticImage;
    citizenCharterStaticImages.add(updatedStaticImage.lastUpdated, staticImage);
  };

  public shared ({ caller }) func removeCitizenCharterStaticImage() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };
    let updatedStaticImage = {
      staticImage = null;
      lastUpdated = Time.now();
    };
    citizenCharterStaticImage := ?updatedStaticImage;
  };

  public query func getCitizenCharterStaticImage() : async CitizenCharterStaticImage {
    switch (citizenCharterStaticImage) {
      case (null) {
        Runtime.trap("No static image found for the Citizen Charter. Please upload an image first!");
      };
      case (?staticImage) { staticImage };
    };
  };

  public query ({ caller }) func getCitizenCharterStaticImageByTimestamp(
    timestamp : Int
  ) : async ?Storage.ExternalBlob {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access historical static images");
    };
    citizenCharterStaticImages.get(timestamp);
  };

  public query ({ caller }) func getCitizenCharterStaticImageById(
    timestamp : Int
  ) : async Storage.ExternalBlob {
    requireInitialized();
    if (not isAnyAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access historical static images");
    };
    switch (citizenCharterStaticImages.get(timestamp)) {
      case (null) { Runtime.trap("Static image not found for the specified timestamp") };
      case (?blob) { blob };
    };
  };

  public shared ({ caller }) func updateCitizenCharterContactInfo() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };
    let updatedInfo = {
      title = "School Contact Information";
      schoolAddress = "Barobo National High School Purok 1B Townsite, Poblacion, Barobo, Surigao del Sur, Philippines 8309.";
      contactInfo = "Phone: (086) 850 - 0113 (JHS), (086) 850 - 0547 (SHS)\nEmail: 304861@deped.gov.ph";
      officeHours = "Monday - Friday 8:00 A.M. - 12:00 P.M. (Morning) 1:00 P.M. - 5:00 P.M. (Afternoon). Saturday - Sunday Closed";
      schoolHours = "For Junior High School (JHS) Monday - Friday 7:15 A.M. - 12:00 P.M. (Morning) 1:00 P.M. - 5:00 P.M. (Afternoon) Saturday - Sunday Closed.\nFor Senior High School (SHS) Monday - Friday 7:30 A.M. - 11:45 A.M. (Morning) 1:00 P.M. - 5:00 P.M. (Afternoon). Saturday - Sunday Closed.";
      lastUpdated = Time.now();
    };
    citizenCharterContactInfo := ?updatedInfo;
  };

  public query func getCitizenCharterContactInfo() : async CitizenCharterContactInfo {
    switch (citizenCharterContactInfo) {
      case (null) {
        Runtime.trap("No contact information found for the Citizen Charter. Please add at least one entry first!");
      };
      case (?contactInfo) { contactInfo };
    };
  };

  public type AlumniProfile = {
    id : Nat;
    name : Text;
    graduationYear : Text;
    achievements : Text;
    currentPosition : Text;
  };

  public type AlumniContent = {
    title : Text;
    description : Text;
    communityEngagement : Text;
    lastUpdated : Int;
  };

  let alumniProfiles = Map.empty<Nat, AlumniProfile>();
  var alumniContent : ?AlumniContent = null;
  let alumniMessages = Map.empty<Nat, Text>();
  var alumniNextIdVar = 0;

  func generateAlumniId() : Nat {
    let id = alumniNextIdVar;
    alumniNextIdVar += 1;
    id;
  };

  public shared ({ caller }) func createAlumniProfile(
    name : Text,
    graduationYear : Text,
    achievements : Text,
    currentPosition : Text
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageAlumni)) {
      Runtime.trap("Unauthorized: You need ManageAlumni permission");
    };
    let id = generateAlumniId();
    let profile : AlumniProfile = {
      id;
      name;
      graduationYear;
      achievements;
      currentPosition;
    };
    alumniProfiles.add(id, profile);
  };

  public query func getAllAlumniProfiles() : async [AlumniProfile] {
    alumniProfiles.values().toArray();
  };

  public query func getAlumniProfile(id : Nat) : async AlumniProfile {
    switch (alumniProfiles.get(id)) {
      case (null) { Runtime.trap("Alumni profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updateAlumniProfile(
    id : Nat,
    name : Text,
    graduationYear : Text,
    achievements : Text,
    currentPosition : Text
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageAlumni)) {
      Runtime.trap("Unauthorized: You need ManageAlumni permission");
    };
    switch (alumniProfiles.get(id)) {
      case (null) { Runtime.trap("Alumni profile not found") };
      case (?_existingProfile) {
        let updatedProfile : AlumniProfile = {
          id;
          name;
          graduationYear;
          achievements;
          currentPosition;
        };
        alumniProfiles.add(id, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func deleteAlumniProfile(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageAlumni)) {
      Runtime.trap("Unauthorized: You need ManageAlumni permission");
    };
    switch (alumniProfiles.get(id)) {
      case (null) { Runtime.trap("Alumni profile not found") };
      case (?_) {
        alumniProfiles.remove(id);
      };
    };
  };

  public shared ({ caller }) func updateAlumniContent(
    title : Text,
    description : Text,
    communityEngagement : Text
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageAlumni)) {
      Runtime.trap("Unauthorized: You need ManageAlumni permission");
    };
    let newContent : AlumniContent = {
      title;
      description;
      communityEngagement;
      lastUpdated = Time.now();
    };
    alumniContent := ?newContent;
  };

  public query func getAlumniContent() : async AlumniContent {
    switch (alumniContent) {
      case (null) {
        Runtime.trap("No Alumni content found. Please initialize the content with a title, description, and invitation for community engagement before proceeding!");
      };
      case (?content) { content };
    };
  };

  public type ResourceSubcategory = {
    title : Text;
    url : Text;
    isExternal : Bool;
  };

  let resourceSubcategories = Map.empty<Text, ResourceSubcategory>();

  func addResourceSubcategory(title : Text, url : Text, isExternal : Bool) {
    let subcategory : ResourceSubcategory = {
      title;
      url;
      isExternal;
    };
    resourceSubcategories.add(title, subcategory);
  };

  public shared ({ caller }) func initializeResources() : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageResources)) {
      Runtime.trap("Unauthorized: You need ManageResources permission");
    };

    addResourceSubcategory("DepEd TV", "https://www.youtube.com/@DepEdTV", true);
    addResourceSubcategory(
      "Learning Materials and Resources",
      "https://1drv.ms/f/c/bac784056b95594f/IgB25szVm3tfQJwK0KpTVfB3AdNyOkxnOty8rbrcufL06I0?e=zbZ9hC",
      true,
    );
    addResourceSubcategory("DepEd EdTech Unit", "https://www.youtube.com/@EducationalTechnologyUnit", true);
  };

  public query func getResourceSubcategory(title : Text) : async ResourceSubcategory {
    switch (resourceSubcategories.get(title)) {
      case (null) { Runtime.trap("Resource subcategory not found") };
      case (?subcategory) { subcategory };
    };
  };

  public query func getAllResourceSubcategories() : async [ResourceSubcategory] {
    if (resourceSubcategories.isEmpty()) {
      Runtime.trap("No resource subcategories found. Please ensure they are initialized.");
    };
    resourceSubcategories.values().toArray();
  };

  public type FooterContactInfo = {
    schoolAddress : Text;
    phone : Text;
    email : Text;
    lastUpdated : Int;
  };

  public type FooterSocialMedia = {
    facebookUrl : Text;
    lastUpdated : Int;
  };

  var footerContactInfo : ?FooterContactInfo = null;
  var footerSocialMedia : ?FooterSocialMedia = null;

  public shared ({ caller }) func updateFooterContactInfo(
    schoolAddress : Text,
    phone : Text,
    email : Text
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageFooter)) {
      Runtime.trap("Unauthorized: You need ManageFooter permission");
    };

    let updatedInfo : FooterContactInfo = {
      schoolAddress;
      phone;
      email;
      lastUpdated = Time.now();
    };
    footerContactInfo := ?updatedInfo;
  };

  public shared ({ caller }) func updateFooterSocialMedia(facebookUrl : Text) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageFooter)) {
      Runtime.trap("Unauthorized: You need ManageFooter permission");
    };

    let updatedSocial : FooterSocialMedia = {
      facebookUrl;
      lastUpdated = Time.now();
    };
    footerSocialMedia := ?updatedSocial;
  };

  public query func getFooterContactInfo() : async FooterContactInfo {
    switch (footerContactInfo) {
      case (null) {
        {
          schoolAddress = "Purok 1B Townsite, Poblacion, Barobo, Surigao del Sur";
          phone = "(086) 850 - 0113 (JHS), (086) 850 - 0547 (SHS)";
          email = "304861@deped.gov.ph";
          lastUpdated = Time.now();
        };
      };
      case (?info) { info };
    };
  };

  public query func getFooterSocialMedia() : async FooterSocialMedia {
    switch (footerSocialMedia) {
      case (null) {
        {
          facebookUrl = "https://www.facebook.com/BaroboNationalHighSchool";
          lastUpdated = Time.now();
        };
      };
      case (?social) { social };
    };
  };

  public type ContactInfoSection = {
    id : Nat;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
    isActive : Bool;
  };

  public type OfficeHoursSection = {
    id : Nat;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
    isActive : Bool;
  };

  public type SchoolHoursSection = {
    id : Nat;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
    isActive : Bool;
  };

  let contactInfoSections = Map.empty<Nat, ContactInfoSection>();
  let officeHoursSections = Map.empty<Nat, OfficeHoursSection>();
  let schoolHoursSections = Map.empty<Nat, SchoolHoursSection>();

  var nextContactInfoId = 1;
  var nextOfficeHoursId = 1;
  var nextSchoolHoursId = 1;

  public shared ({ caller }) func createContactInfoSection(content : Text) : async Nat {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    let id = nextContactInfoId;
    nextContactInfoId += 1;

    let section : ContactInfoSection = {
      id;
      content;
      createdAt = Time.now();
      updatedAt = Time.now();
      isActive = true;
    };

    contactInfoSections.add(id, section);
    id;
  };

  public shared ({ caller }) func updateContactInfoSection(id : Nat, content : Text) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    switch (contactInfoSections.get(id)) {
      case (null) { Runtime.trap("Contact info section not found") };
      case (?existing) {
        let updatedSection = {
          existing with
          content;
          updatedAt = Time.now();
        };
        contactInfoSections.add(id, updatedSection);
      };
    };
  };

  public shared ({ caller }) func deleteContactInfoSection(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    switch (contactInfoSections.get(id)) {
      case (null) { Runtime.trap("Contact info section not found") };
      case (?_) {
        contactInfoSections.remove(id);
      };
    };
  };

  public query func getContactInfoSection(id : Nat) : async ContactInfoSection {
    switch (contactInfoSections.get(id)) {
      case (null) { Runtime.trap("Contact info section not found") };
      case (?section) { section };
    };
  };

  public query func getAllContactInfoSections() : async [ContactInfoSection] {
    contactInfoSections.values().toArray();
  };

  public shared ({ caller }) func createOfficeHoursSection(content : Text) : async Nat {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    let id = nextOfficeHoursId;
    nextOfficeHoursId += 1;

    let section : OfficeHoursSection = {
      id;
      content;
      createdAt = Time.now();
      updatedAt = Time.now();
      isActive = true;
    };

    officeHoursSections.add(id, section);
    id;
  };

  public shared ({ caller }) func updateOfficeHoursSection(
    id : Nat,
    content : Text
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    switch (officeHoursSections.get(id)) {
      case (null) { Runtime.trap("Office hours section not found") };
      case (?existing) {
        let updatedSection = {
          existing with
          content;
          updatedAt = Time.now();
        };
        officeHoursSections.add(id, updatedSection);
      };
    };
  };

  public shared ({ caller }) func deleteOfficeHoursSection(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    switch (officeHoursSections.get(id)) {
      case (null) { Runtime.trap("Office hours section not found") };
      case (?_) {
        officeHoursSections.remove(id);
      };
    };
  };

  public query func getOfficeHoursSection(id : Nat) : async OfficeHoursSection {
    switch (officeHoursSections.get(id)) {
      case (null) { Runtime.trap("Office hours section not found") };
      case (?section) { section };
    };
  };

  public query func getAllOfficeHoursSections() : async [OfficeHoursSection] {
    officeHoursSections.values().toArray();
  };

  public shared ({ caller }) func createSchoolHoursSection(content : Text) : async Nat {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    let id = nextSchoolHoursId;
    nextSchoolHoursId += 1;

    let section : SchoolHoursSection = {
      id;
      content;
      createdAt = Time.now();
      updatedAt = Time.now();
      isActive = true;
    };

    schoolHoursSections.add(id, section);
    id;
  };

  public shared ({ caller }) func updateSchoolHoursSection(
    id : Nat,
    content : Text
  ) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    switch (schoolHoursSections.get(id)) {
      case (null) { Runtime.trap("School hours section not found") };
      case (?existing) {
        let updatedSection = {
          existing with
          content;
          updatedAt = Time.now();
        };
        schoolHoursSections.add(id, updatedSection);
      };
    };
  };

  public shared ({ caller }) func deleteSchoolHoursSection(id : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageCitizenCharter)) {
      Runtime.trap("Unauthorized: You need ManageCitizenCharter permission");
    };

    switch (schoolHoursSections.get(id)) {
      case (null) { Runtime.trap("School hours section not found") };
      case (?_) {
        schoolHoursSections.remove(id);
      };
    };
  };

  public query func getSchoolHoursSection(id : Nat) : async SchoolHoursSection {
    switch (schoolHoursSections.get(id)) {
      case (null) { Runtime.trap("School hours section not found") };
      case (?section) { section };
    };
  };

  public query func getAllSchoolHoursSections() : async [SchoolHoursSection] {
    schoolHoursSections.values().toArray();
  };

  public type DepEdVisionContent = {
    lastUpdated : Int;
    version : Nat;
    vision : Text;
    mission : Text;
    coreValues : Text;
    mandates : Text;
    bnhsStatisticalBulletinTitle : Text;
  };

  var depedVisionContent : ?DepEdVisionContent = null;

  public shared ({ caller }) func updateDepEdVision(newVersion : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageFooter)) {
      Runtime.trap("Unauthorized: You need ManageFooter permission");
    };

    depedVisionContent := ?{
      lastUpdated = Time.now();
      version = newVersion;
      vision =
        "We dream of Filipinos \n who passionately love their country \n and whose values and competencies \n enable them to realize their full potential \n and contribute meaningfully to building the nation. \n \n As a learner-centered public institution, \n the Department of Education \n continuously improves itself \n to better serve its stakeholders.";
      mission = "MISSION (unchanged)";
      coreValues = "CORE VALUES (unchanged)";
      mandates =
        "The Department of Education was established through the Education Decree of 1863 as the Superior Commission of Primary Instruction under a Chairman. The Education agency underwent many reorganization efforts in the 20th century in order to better define its purpose vis a vis the changing administrations and charters. The present day Department of Education was eventually mandated through Republic Act 9155, otherwise known as the Governance of Basic Education act of 2001 which establishes the mandate of this agency.  \n\n The Department of Education (DepEd) formulates, implements, and coordinates policies, plans, programs and projects in the areas of formal and non-formal basic education. It supervises all elementary and secondary education institutions, including alternative learning systems, both public and private; and provides for the establishment and maintenance of a complete, adequate, and integrated system of basic education relevant to the goals of national development. ";
      bnhsStatisticalBulletinTitle = "Barobo National High School Statistical Bulletin";
    };
  };

  public query func getDepEdVision() : async DepEdVisionContent {
    switch (depedVisionContent) {
      case (null) { Runtime.trap("DepEd Vision content not found") };
      case (?content) { content };
    };
  };

  public type DepEdMissionContent = {
    lastUpdated : Int;
    version : Nat;
    mission : Text;
  };

  var depedMissionContent : ?DepEdMissionContent = null;

  public shared ({ caller }) func updateDepEdMission(newVersion : Nat) : async () {
    requireInitialized();
    if (not hasPermission(caller, #ManageFooter)) {
      Runtime.trap("Unauthorized: You need ManageFooter permission");
    };

    depedMissionContent := ?{
      lastUpdated = Time.now();
      version = newVersion;
      mission =
        "To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where: \n \n \u{2013} **Students** learn in a child-friendly, gender-sensitive, safe, and motivating environment. \n \n \u{2013} **Teachers** facilitate learning and constantly nurture every learner. \n \n \u{2013} **Administrators and staff**, as stewards of the institution, ensure an enabling and supportive environment for effective learning to happen. \n \n \u{2013} **Family, community, and other stakeholders** are actively engaged and share responsibility for developing life-long learners.";
    };
  };

  public query func getDepEdMission() : async DepEdMissionContent {
    switch (depedMissionContent) {
      case (null) { Runtime.trap("DepEd Mission content not found") };
      case (?content) { content };
    };
  };
};
