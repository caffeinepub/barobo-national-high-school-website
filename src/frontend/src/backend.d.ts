import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ResourceSubcategory {
    url: string;
    title: string;
    isExternal: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DepEdVisionContent {
    mission: string;
    coreValues: string;
    lastUpdated: bigint;
    version: bigint;
    bnhsStatisticalBulletinTitle: string;
    mandates: string;
    vision: string;
}
export interface HeritageSectionContent {
    title: string;
    lastUpdated: bigint;
    formattedText: FormattedText;
    backgroundImage?: ExternalBlob;
    orgChartBackground?: ExternalBlob;
}
export interface DepEdMissionContent {
    mission: string;
    lastUpdated: bigint;
    version: bigint;
}
export interface SliderImage {
    id: bigint;
    title: string;
    displayOrder: bigint;
    description: string;
    timestamp: bigint;
    image: SliderImageSource;
}
export interface BannerFileMetadata {
    id: bigint;
    isAnimated: boolean;
    file: ExternalBlob;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface FormattedText {
    content: string;
    fontStyle: FontStyle;
    fontSize: number;
    alignment: TextAlignment;
}
export interface ClubOrganization {
    id: bigint;
    members: Array<string>;
    name: string;
    activities: Array<string>;
    description: string;
}
export interface OrganizationalStructureContent {
    lastUpdated: bigint;
    titleBackground?: ExternalBlob;
    staticImage?: ExternalBlob;
}
export interface FileTypeBreakdown {
    documents: bigint;
    videos: bigint;
    images: bigint;
}
export interface BannerImage {
    id: bigint;
    title: string;
    description: string;
    isActive: boolean;
    timestamp: bigint;
    image: BannerImageSource;
}
export interface CitizenCharterBackground {
    lastUpdated: bigint;
    isActive: boolean;
    backgroundImage?: ExternalBlob;
}
export interface CitizenCharterStaticImage {
    lastUpdated: bigint;
    staticImage?: ExternalBlob;
}
export interface StorageStats {
    fileCount: bigint;
    lastUpdated: bigint;
    usedSpace: bigint;
    availableSpace: bigint;
    totalCapacity: bigint;
}
export interface FooterContactInfo {
    lastUpdated: bigint;
    email: string;
    schoolAddress: string;
    phone: string;
}
export interface Header {
    value: string;
    name: string;
}
export interface CitizenCharterContactInfo {
    title: string;
    contactInfo: string;
    officeHours: string;
    lastUpdated: bigint;
    schoolAddress: string;
    schoolHours: string;
}
export type BannerImageSource = {
    __kind__: "url";
    url: string;
} | {
    __kind__: "file";
    file: BannerFileMetadata;
};
export interface BNHSHymnContent {
    video: ExternalBlob;
    lastUpdated: bigint;
}
export interface AlumniProfile {
    id: bigint;
    name: string;
    graduationYear: string;
    achievements: string;
    currentPosition: string;
}
export interface SchoolHoursSection {
    id: bigint;
    content: string;
    createdAt: bigint;
    isActive: boolean;
    updatedAt: bigint;
}
export interface ContactInfoSection {
    id: bigint;
    content: string;
    createdAt: bigint;
    isActive: boolean;
    updatedAt: bigint;
}
export type SliderImageSource = {
    __kind__: "url";
    url: string;
} | {
    __kind__: "file";
    file: BannerFileMetadata;
};
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface FooterSocialMedia {
    lastUpdated: bigint;
    facebookUrl: string;
}
export interface OfficeHoursSection {
    id: bigint;
    content: string;
    createdAt: bigint;
    isActive: boolean;
    updatedAt: bigint;
}
export interface AdminUserData {
    permissions: Array<AdminPermission>;
    principal: Principal;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    email: string;
    lastLogin?: bigint;
}
export interface LoginRecord {
    principal: Principal;
    role: string;
    timestamp: bigint;
}
export interface AnalyticsPeriod {
    monthly: bigint;
    yearly: bigint;
    daily: bigint;
    weekly: bigint;
}
export interface AlumniContent {
    title: string;
    lastUpdated: bigint;
    description: string;
    communityEngagement: string;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export enum AdminPermission {
    ManageResources = "ManageResources",
    ManageAlumni = "ManageAlumni",
    ManageSlider = "ManageSlider",
    ManageCitizenCharter = "ManageCitizenCharter",
    ManageHeritage = "ManageHeritage",
    ManageHymn = "ManageHymn",
    ManageBanners = "ManageBanners",
    ManageFooter = "ManageFooter",
    ManageClubs = "ManageClubs"
}
export enum FontStyle {
    italic = "italic",
    normal = "normal",
    bold = "bold",
    underline = "underline"
}
export enum TextAlignment {
    center = "center",
    left = "left",
    justify = "justify",
    right = "right"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateBanner(id: bigint): Promise<void>;
    addBannerImage(image: BannerImageSource, title: string, description: string): Promise<BannerImage>;
    addSliderImage(image: SliderImageSource, title: string, description: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAdminUser(userPrincipal: Principal, name: string, email: string, permissions: Array<AdminPermission>): Promise<void>;
    createAlumniProfile(name: string, graduationYear: string, achievements: string, currentPosition: string): Promise<void>;
    createClubOrganization(name: string, description: string, members: Array<string>, activities: Array<string>): Promise<void>;
    createContactInfoSection(content: string): Promise<bigint>;
    createOfficeHoursSection(content: string): Promise<bigint>;
    createSchoolHoursSection(content: string): Promise<bigint>;
    deactivateBanner(id: bigint): Promise<void>;
    deleteAdminUser(userPrincipal: Principal): Promise<void>;
    deleteAlumniProfile(id: bigint): Promise<void>;
    deleteBanner(id: bigint): Promise<void>;
    deleteClubOrganization(id: bigint): Promise<void>;
    deleteContactInfoSection(id: bigint): Promise<void>;
    deleteOfficeHoursSection(id: bigint): Promise<void>;
    deleteSchoolHoursSection(id: bigint): Promise<void>;
    deleteSliderImage(id: bigint): Promise<void>;
    getActiveBanners(): Promise<Array<BannerImage>>;
    getAdminUser(userPrincipal: Principal): Promise<AdminUserData>;
    getAllAdminUsers(): Promise<Array<AdminUserData>>;
    getAllAlumniProfiles(): Promise<Array<AlumniProfile>>;
    getAllBanners(): Promise<Array<BannerImage>>;
    getAllContactInfoSections(): Promise<Array<ContactInfoSection>>;
    getAllOfficeHoursSections(): Promise<Array<OfficeHoursSection>>;
    getAllResourceSubcategories(): Promise<Array<ResourceSubcategory>>;
    getAllSchoolHoursSections(): Promise<Array<SchoolHoursSection>>;
    getAllSliderImages(): Promise<Array<SliderImage>>;
    getAlumniContent(): Promise<AlumniContent>;
    getAlumniProfile(id: bigint): Promise<AlumniProfile>;
    getBNHSHymnMetadata(): Promise<BNHSHymnContent>;
    getBNHSHymnVideo(): Promise<ExternalBlob>;
    getBannerById(id: bigint): Promise<BannerImage>;
    getBannerVersion(): Promise<bigint>;
    getCallerPermissions(): Promise<Array<AdminPermission>>;
    getCallerRole(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCitizenCharterBackground(): Promise<CitizenCharterBackground>;
    getCitizenCharterBackgroundImage(timestamp: bigint): Promise<ExternalBlob | null>;
    getCitizenCharterBackgroundImageById(timestamp: bigint): Promise<ExternalBlob>;
    getCitizenCharterContactInfo(): Promise<CitizenCharterContactInfo>;
    getCitizenCharterStaticImage(): Promise<CitizenCharterStaticImage>;
    getCitizenCharterStaticImageById(timestamp: bigint): Promise<ExternalBlob>;
    getCitizenCharterStaticImageByTimestamp(timestamp: bigint): Promise<ExternalBlob | null>;
    getClubOrganization(id: bigint): Promise<ClubOrganization>;
    getClubOrganizations(): Promise<Array<ClubOrganization>>;
    getContactInfoSection(id: bigint): Promise<ContactInfoSection>;
    getCurrentBanner(): Promise<BannerImage>;
    getDepEdMission(): Promise<DepEdMissionContent>;
    getDepEdVision(): Promise<DepEdVisionContent>;
    getFileTypeBreakdown(): Promise<FileTypeBreakdown>;
    getFooterContactInfo(): Promise<FooterContactInfo>;
    getFooterSocialMedia(): Promise<FooterSocialMedia>;
    getHeritageSection(): Promise<HeritageSectionContent>;
    getHistoryBackgroundImage(timestamp: bigint): Promise<ExternalBlob | null>;
    getHistoryBackgroundImageById(timestamp: bigint): Promise<ExternalBlob>;
    getLastActiveBanner(): Promise<BannerImage>;
    getLoginAnalytics(): Promise<AnalyticsPeriod>;
    getOfficeHoursSection(id: bigint): Promise<OfficeHoursSection>;
    getOrganizationalStructure(): Promise<OrganizationalStructureContent>;
    getRecentLoginRecords(limit: bigint): Promise<Array<LoginRecord>>;
    getResourceSubcategory(title: string): Promise<ResourceSubcategory>;
    getSchoolHoursSection(id: bigint): Promise<SchoolHoursSection>;
    getSliderImage(id: bigint): Promise<SliderImage>;
    getStorageStats(): Promise<StorageStats>;
    getTotalVisitors(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorAnalytics(): Promise<AnalyticsPeriod>;
    initializeResources(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    proxyPublicImage(imageUrl: string, extraHeaders: Array<Header>): Promise<string>;
    recordLogin(): Promise<void>;
    recordVisitor(sessionId: string): Promise<void>;
    removeBNHSHymn(): Promise<void>;
    removeCitizenCharterBackgroundImage(): Promise<void>;
    removeCitizenCharterStaticImage(): Promise<void>;
    removeHistoryBackgroundImage(): Promise<void>;
    removeOrganizationalChartBackground(): Promise<void>;
    removeOrganizationalStructureStaticImage(): Promise<void>;
    removeOrganizationalStructureTitleBackground(): Promise<void>;
    reorderSliderImages(newOrder: Array<bigint>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminUserStatus(userPrincipal: Principal, isActive: boolean): Promise<void>;
    setBNHSHymn(videoFile: ExternalBlob): Promise<void>;
    setCitizenCharterBackgroundImage(backgroundImage: ExternalBlob): Promise<void>;
    setCitizenCharterStaticImage(staticImage: ExternalBlob): Promise<void>;
    setHistoryBackgroundImage(backgroundImage: ExternalBlob): Promise<void>;
    setOrganizationalChartBackground(orgChartBackground: ExternalBlob): Promise<void>;
    setOrganizationalStructureStaticImage(staticImage: ExternalBlob): Promise<void>;
    setOrganizationalStructureTitleBackground(titleBackground: ExternalBlob): Promise<void>;
    swapSliderImages(id1: bigint, id2: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAdminUserPermissions(userPrincipal: Principal, permissions: Array<AdminPermission>): Promise<void>;
    updateAlumniContent(title: string, description: string, communityEngagement: string): Promise<void>;
    updateAlumniProfile(id: bigint, name: string, graduationYear: string, achievements: string, currentPosition: string): Promise<void>;
    updateBannerImage(id: bigint, image: BannerImageSource, title: string, description: string): Promise<BannerImage>;
    updateCitizenCharterContactInfo(): Promise<void>;
    updateClubOrganization(id: bigint, name: string, description: string, members: Array<string>, activities: Array<string>): Promise<void>;
    updateContactInfoSection(id: bigint, content: string): Promise<void>;
    updateDepEdMission(newVersion: bigint): Promise<void>;
    updateDepEdVision(newVersion: bigint): Promise<void>;
    updateFooterContactInfo(schoolAddress: string, phone: string, email: string): Promise<void>;
    updateFooterSocialMedia(facebookUrl: string): Promise<void>;
    updateHeritageSection(title: string, formattedText: FormattedText): Promise<void>;
    updateOfficeHoursSection(id: bigint, content: string): Promise<void>;
    updateSchoolHoursSection(id: bigint, content: string): Promise<void>;
    updateSliderImage(id: bigint, image: SliderImageSource, title: string, description: string, displayOrder: bigint): Promise<void>;
}
