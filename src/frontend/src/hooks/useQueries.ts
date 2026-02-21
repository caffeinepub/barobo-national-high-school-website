import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob, BannerImage, BannerFileMetadata, SliderImage, HeritageSectionContent, FormattedText, CitizenCharterBackground, CitizenCharterStaticImage, AlumniContent, AlumniProfile, AdminUserData, AdminPermission, UserProfile, AnalyticsPeriod, LoginRecord, StorageStats, FileTypeBreakdown, ContactInfoSection, OfficeHoursSection, SchoolHoursSection, DepEdMissionContent, OrganizationalStructureContent, SuperAdminStatus } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  description: string;
};

type Announcement = {
  id: number;
  title: string;
  publishDate: string;
  content: string;
  important: boolean;
};

export function useGetEvents() {
  return useQuery<CalendarEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      return [];
    },
    enabled: true,
  });
}

export function useGetAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      return [];
    },
    enabled: true,
  });
}

// User Profile and Role Management
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerRole();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetCallerPermissions() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminPermission[]>({
    queryKey: ['callerPermissions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerPermissions();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Super Admin Status Query
export function useGetSuperAdminStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<SuperAdminStatus>({
    queryKey: ['superAdminStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSuperAdminStatus();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Initialize Super Admin (auto-initialization)
export function useInitializeSuperAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeSuperAdmin();
    },
    onSuccess: async () => {
      // Invalidate and refetch all related queries
      await queryClient.invalidateQueries({ queryKey: ['superAdminStatus'] });
      await queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      await queryClient.invalidateQueries({ queryKey: ['callerPermissions'] });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['superAdminStatus'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['callerRole'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['callerPermissions'], type: 'active' }),
      ]);
    },
  });
}

// Super Admin Recovery
export function useRecoverSuperAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.recoverSuperAdmin();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      await queryClient.invalidateQueries({ queryKey: ['callerPermissions'] });
      await new Promise(resolve => setTimeout(resolve, 500));
      await queryClient.refetchQueries({ queryKey: ['callerRole'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['callerPermissions'], type: 'active' });
    },
  });
}

// Initialize Admin Session (post-login role initialization)
export function useInitializeAdminSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Call recordLogin to ensure backend initializes the session
      await actor.recordLogin();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      await queryClient.invalidateQueries({ queryKey: ['callerPermissions'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['callerRole'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['callerPermissions'], type: 'active' });
    },
  });
}

// Admin User Management (Super Admin only)
export function useGetAllAdminUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminUserData[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAdminUsers();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useCreateAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userPrincipal,
      name,
      email,
      permissions,
    }: {
      userPrincipal: string;
      name: string;
      email: string;
      permissions: AdminPermission[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      await actor.createAdminUser(principal, name, email, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useUpdateAdminUserPermissions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userPrincipal,
      permissions,
    }: {
      userPrincipal: string;
      permissions: AdminPermission[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      await actor.updateAdminUserPermissions(principal, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useSetAdminUserStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userPrincipal,
      isActive,
    }: {
      userPrincipal: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      await actor.setAdminUserStatus(principal, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useDeleteAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      await actor.deleteAdminUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

// Visitor Analytics
export function useRecordVisitor() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.recordVisitor(sessionId);
    },
  });
}

export function useRecordLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.recordLogin();
    },
  });
}

export function useGetTotalVisitors() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalVisitors'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTotalVisitors();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetVisitorAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsPeriod>({
    queryKey: ['visitorAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVisitorAnalytics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useGetLoginAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsPeriod>({
    queryKey: ['loginAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLoginAnalytics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useGetRecentLoginRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<LoginRecord[]>({
    queryKey: ['recentLoginRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRecentLoginRecords(BigInt(10));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

// Storage Monitoring
export function useGetStorageStats() {
  const { actor, isFetching } = useActor();

  return useQuery<StorageStats>({
    queryKey: ['storageStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStorageStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetFileTypeBreakdown() {
  const { actor, isFetching } = useActor();

  return useQuery<FileTypeBreakdown>({
    queryKey: ['fileTypeBreakdown'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFileTypeBreakdown();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetBannerVersion() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['bannerVersion'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBannerVersion();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGetBanners() {
  const { actor, isFetching } = useActor();
  const { data: bannerVersion } = useGetBannerVersion();

  return useQuery<BannerImage[]>({
    queryKey: ['banners', bannerVersion?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const banners = await actor.getAllBanners();
        return banners.sort((a, b) => Number(b.timestamp - a.timestamp));
      } catch (error: any) {
        if (error.message?.includes('No banners found')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useGetCurrentBanner() {
  const { actor, isFetching } = useActor();
  const { data: bannerVersion } = useGetBannerVersion();

  return useQuery<BannerImage | null>({
    queryKey: ['currentBanner', bannerVersion?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const banner = await actor.getCurrentBanner();
        return banner;
      } catch (error: any) {
        if (error.message?.includes('No banners found') || error.message?.includes('No active banners found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useCreateBannerFromBlob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      isActive,
      isAnimated,
    }: {
      file: ExternalBlob;
      title: string;
      description: string;
      isActive: boolean;
      isAnimated: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const bannerFile: BannerFileMetadata = {
        id: BigInt(0),
        file,
        isAnimated,
      };

      const newBanner = await actor.addBannerImage(
        { __kind__: 'file', file: bannerFile },
        title,
        description
      );

      if (isActive) {
        await actor.activateBanner(newBanner.id);
      }

      return newBanner;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['bannerVersion'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['currentBanner'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['bannerVersion'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['currentBanner'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['banners'], type: 'active' }),
      ]);
    },
    onError: (error: any) => {
      console.error('Banner upload error:', error);
    },
  });
}

export function useCreateBannerFromURL() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      url,
      title,
      description,
      isActive,
    }: {
      url: string;
      title: string;
      description: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const newBanner = await actor.addBannerImage(
        { __kind__: 'url', url },
        title,
        description
      );

      if (isActive) {
        await actor.activateBanner(newBanner.id);
      }

      return newBanner;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['bannerVersion'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['currentBanner'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['bannerVersion'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['currentBanner'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['banners'], type: 'active' }),
      ]);
    },
    onError: (error: any) => {
      console.error('Banner upload error:', error);
    },
  });
}

export function useDeleteBanner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteBanner(id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['bannerVersion'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['currentBanner'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['bannerVersion'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['currentBanner'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['banners'], type: 'active' }),
      ]);
    },
    onError: (error: any) => {
      console.error('Banner delete error:', error);
    },
  });
}

export function useGetSliderImages() {
  const { actor, isFetching } = useActor();

  return useQuery<SliderImage[]>({
    queryKey: ['sliderImages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const images = await actor.getAllSliderImages();
        return images.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
      } catch (error: any) {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5000,
    gcTime: 10000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useAddSliderImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      isAnimated,
    }: {
      file: ExternalBlob;
      title: string;
      description: string;
      isAnimated: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const sliderFile: BannerFileMetadata = {
        id: BigInt(0),
        file,
        isAnimated,
      };

      return actor.addSliderImage(
        { __kind__: 'file', file: sliderFile },
        title,
        description
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
    },
  });
}

export function useAddSliderImageFromURL() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      url,
      title,
      description,
    }: {
      url: string;
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      return actor.addSliderImage(
        { __kind__: 'url', url },
        title,
        description
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
    },
  });
}

export function useUpdateSliderImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      file,
      title,
      description,
      displayOrder,
      isAnimated,
    }: {
      id: bigint;
      file: ExternalBlob;
      title: string;
      description: string;
      displayOrder: bigint;
      isAnimated: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const sliderFile: BannerFileMetadata = {
        id: BigInt(0),
        file,
        isAnimated,
      };

      await actor.updateSliderImage(
        id,
        { __kind__: 'file', file: sliderFile },
        title,
        description,
        displayOrder
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
    },
  });
}

export function useDeleteSliderImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteSliderImage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
    },
  });
}

export function useGetHeritageSection() {
  const { actor, isFetching } = useActor();

  return useQuery<HeritageSectionContent>({
    queryKey: ['heritageSection'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHeritageSection();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Alias for backward compatibility
export const useGetHistoryContent = useGetHeritageSection;

export function useUpdateHeritageSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      formattedText,
    }: {
      title: string;
      formattedText: FormattedText;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateHeritageSection(title, formattedText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heritageSection'] });
    },
  });
}

// Alias for backward compatibility
export const useUpdateHistoryContent = useUpdateHeritageSection;

export function useSetHistoryBackgroundImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backgroundImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setHistoryBackgroundImage(backgroundImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heritageSection'] });
    },
  });
}

// Alias for backward compatibility
export const useUpdateHistoryBackgroundImage = useSetHistoryBackgroundImage;

export function useRemoveHistoryBackgroundImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeHistoryBackgroundImage();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heritageSection'] });
    },
  });
}

export function useGetOrganizationalStructure() {
  const { actor, isFetching } = useActor();

  return useQuery<OrganizationalStructureContent>({
    queryKey: ['organizationalStructure'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrganizationalStructure();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrganizationalStructureTitleBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (titleBackground: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOrganizationalStructureTitleBackground(titleBackground);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
    },
  });
}

export function useRemoveOrganizationalStructureTitleBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeOrganizationalStructureTitleBackground();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
    },
  });
}

export function useUpdateOrganizationalStructureStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staticImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOrganizationalStructureStaticImage(staticImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
    },
  });
}

export function useRemoveOrganizationalStructureStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeOrganizationalStructureStaticImage();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
    },
  });
}

// Citizen Charter - Public queries for background and static images
export function useGetCitizenCharterBackgroundPublic() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['citizenCharterBackgroundPublic'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCitizenCharterBackgroundImage();
      } catch (error: any) {
        console.error('Error fetching Citizen Charter background:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5000,
    refetchOnMount: 'always',
  });
}

export function useGetCitizenCharterStaticImagePublic() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['citizenCharterStaticImagePublic'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCitizenCharterStaticImagePublic();
      } catch (error: any) {
        console.error('Error fetching Citizen Charter static image:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5000,
    refetchOnMount: 'always',
  });
}

// Citizen Charter - Admin queries
export function useGetCitizenCharterBackground() {
  const { actor, isFetching } = useActor();

  return useQuery<CitizenCharterBackground | null>({
    queryKey: ['citizenCharterBackground'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCitizenCharterBackground();
      } catch (error: any) {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCitizenCharterBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backgroundImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCitizenCharterBackgroundImage(backgroundImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterBackground'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterBackgroundPublic'] });
    },
  });
}

export function useRemoveCitizenCharterBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeCitizenCharterBackgroundImage();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterBackground'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterBackgroundPublic'] });
    },
  });
}

export function useGetCitizenCharterStaticImage() {
  const { actor, isFetching } = useActor();

  return useQuery<CitizenCharterStaticImage | null>({
    queryKey: ['citizenCharterStaticImage'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCitizenCharterStaticImage();
      } catch (error: any) {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCitizenCharterStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staticImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCitizenCharterStaticImage(staticImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterStaticImage'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterStaticImagePublic'] });
    },
  });
}

export function useRemoveCitizenCharterStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeCitizenCharterStaticImage();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterStaticImage'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterStaticImagePublic'] });
    },
  });
}

// Contact Info Sections
export function useGetContactInfoSections() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactInfoSection[]>({
    queryKey: ['contactInfoSections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllContactInfoSections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateContactInfoSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createContactInfoSection(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfoSections'] });
    },
  });
}

export function useUpdateContactInfoSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateContactInfoSection(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfoSections'] });
    },
  });
}

export function useDeleteContactInfoSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteContactInfoSection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfoSections'] });
    },
  });
}

// Office Hours Sections
export function useGetOfficeHoursSections() {
  const { actor, isFetching } = useActor();

  return useQuery<OfficeHoursSection[]>({
    queryKey: ['officeHoursSections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllOfficeHoursSections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOfficeHoursSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOfficeHoursSection(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officeHoursSections'] });
    },
  });
}

export function useUpdateOfficeHoursSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOfficeHoursSection(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officeHoursSections'] });
    },
  });
}

export function useDeleteOfficeHoursSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteOfficeHoursSection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officeHoursSections'] });
    },
  });
}

// School Hours Sections
export function useGetSchoolHoursSections() {
  const { actor, isFetching } = useActor();

  return useQuery<SchoolHoursSection[]>({
    queryKey: ['schoolHoursSections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllSchoolHoursSections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSchoolHoursSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSchoolHoursSection(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolHoursSections'] });
    },
  });
}

export function useUpdateSchoolHoursSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSchoolHoursSection(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolHoursSections'] });
    },
  });
}

export function useDeleteSchoolHoursSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteSchoolHoursSection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolHoursSections'] });
    },
  });
}

// Alumni Management
export function useGetAlumniContent() {
  const { actor, isFetching } = useActor();

  return useQuery<AlumniContent>({
    queryKey: ['alumniContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAlumniContent();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateAlumniContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      communityEngagement,
    }: {
      title: string;
      description: string;
      communityEngagement: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateAlumniContent(title, description, communityEngagement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumniContent'] });
    },
  });
}

export function useGetAllAlumniProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<AlumniProfile[]>({
    queryKey: ['alumniProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAlumniProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backward compatibility
export const useGetAlumniProfiles = useGetAllAlumniProfiles;

export function useCreateAlumniProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      graduationYear,
      achievements,
      currentPosition,
    }: {
      name: string;
      graduationYear: string;
      achievements: string;
      currentPosition: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createAlumniProfile(name, graduationYear, achievements, currentPosition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
    },
  });
}

export function useUpdateAlumniProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      graduationYear,
      achievements,
      currentPosition,
    }: {
      id: bigint;
      name: string;
      graduationYear: string;
      achievements: string;
      currentPosition: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateAlumniProfile(id, name, graduationYear, achievements, currentPosition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
    },
  });
}

export function useDeleteAlumniProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAlumniProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
    },
  });
}

// BNHS Hymn Video
export function useGetBNHSHymnVideo() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob>({
    queryKey: ['bnhsHymnVideo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBNHSHymnVideo();
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSetBNHSHymn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoFile: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setBNHSHymn(videoFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bnhsHymnVideo'] });
    },
  });
}

export function useRemoveBNHSHymn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeBNHSHymn();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bnhsHymnVideo'] });
    },
  });
}
