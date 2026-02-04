import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob, BannerImage, BannerFileMetadata, SliderImage, HeritageSectionContent, FormattedText, CitizenCharterBackground, CitizenCharterStaticImage, AlumniContent, AlumniProfile, AdminUserData, AdminPermission, UserProfile, AnalyticsPeriod, LoginRecord, StorageStats, FileTypeBreakdown, ContactInfoSection, OfficeHoursSection, SchoolHoursSection, DepEdMissionContent, OrganizationalStructureContent } from '../backend';
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });
}

export function useAddSliderImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      image,
      title,
      description,
    }: {
      image: { __kind__: 'file'; file: BannerFileMetadata } | { __kind__: 'url'; url: string };
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSliderImage(image, title, description);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['sliderImages'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Slider image add error:', error);
      throw error;
    },
  });
}

export function useUpdateSliderImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      image,
      title,
      description,
      displayOrder,
    }: {
      id: bigint;
      image: { __kind__: 'file'; file: BannerFileMetadata } | { __kind__: 'url'; url: string };
      title: string;
      description: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSliderImage(id, image, title, description, displayOrder);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['sliderImages'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Slider image update error:', error);
    },
  });
}

export function useDeleteSliderImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSliderImage(id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['sliderImages'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['sliderImages'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Slider image delete error:', error);
    },
  });
}

export function useGetHistoryContent() {
  const { actor, isFetching } = useActor();

  return useQuery<HeritageSectionContent>({
    queryKey: ['historyContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHeritageSection();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useUpdateHistoryContent() {
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['historyContent'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['historyContent'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('History content update error:', error);
      throw error;
    },
  });
}

export function useUpdateHistoryBackgroundImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backgroundImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setHistoryBackgroundImage(backgroundImage);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['historyContent'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['historyContent'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('History background update error:', error);
      throw error;
    },
  });
}

export function useUpdateOrgChartBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgChartBackground: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOrganizationalChartBackground(orgChartBackground);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['historyContent'] });
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['historyContent'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['organizationalStructure'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Org chart background update error:', error);
      throw error;
    },
  });
}

export function useRemoveOrgChartBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeOrganizationalChartBackground();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['historyContent'] });
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['historyContent'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['organizationalStructure'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Org chart background remove error:', error);
      throw error;
    },
  });
}

// Organizational Structure Management
export function useGetOrganizationalStructure() {
  const { actor, isFetching } = useActor();

  return useQuery<OrganizationalStructureContent>({
    queryKey: ['organizationalStructure'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrganizationalStructure();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useUpdateOrgStructureTitleBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (titleBackground: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOrganizationalStructureTitleBackground(titleBackground);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['organizationalStructure'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Org structure title background update error:', error);
      throw error;
    },
  });
}

export function useRemoveOrgStructureTitleBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeOrganizationalStructureTitleBackground();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['organizationalStructure'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Org structure title background remove error:', error);
      throw error;
    },
  });
}

export function useUpdateOrgStructureStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staticImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOrganizationalStructureStaticImage(staticImage);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['organizationalStructure'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Org structure static image update error:', error);
      throw error;
    },
  });
}

export function useRemoveOrgStructureStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeOrganizationalStructureStaticImage();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['organizationalStructure'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['organizationalStructure'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Org structure static image remove error:', error);
      throw error;
    },
  });
}

export function useGetCitizenCharterBackground() {
  const { actor, isFetching } = useActor();

  return useQuery<CitizenCharterBackground | null>({
    queryKey: ['citizenCharterBackground'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCitizenCharterBackground();
      } catch (error: any) {
        if (error.message?.includes('No background found')) {
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

export function useUpdateCitizenCharterBackground() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backgroundImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCitizenCharterBackgroundImage(backgroundImage);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterBackground'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['citizenCharterBackground'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Citizen Charter background update error:', error);
      throw error;
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterBackground'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['citizenCharterBackground'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Citizen Charter background remove error:', error);
      throw error;
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
        if (error.message?.includes('No static image found')) {
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

export function useUpdateCitizenCharterStaticImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staticImage: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCitizenCharterStaticImage(staticImage);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterStaticImage'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['citizenCharterStaticImage'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Citizen Charter static image update error:', error);
      throw error;
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['citizenCharterStaticImage'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['citizenCharterStaticImage'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Citizen Charter static image remove error:', error);
      throw error;
    },
  });
}

// Contact Info Section CRUD
export function useGetAllContactInfoSections() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactInfoSection[]>({
    queryKey: ['contactInfoSections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllContactInfoSections();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfoSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['contactInfoSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfoSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['contactInfoSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfoSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['contactInfoSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
    },
  });
}

// Office Hours Section CRUD
export function useGetAllOfficeHoursSections() {
  const { actor, isFetching } = useActor();

  return useQuery<OfficeHoursSection[]>({
    queryKey: ['officeHoursSections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllOfficeHoursSections();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['officeHoursSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['officeHoursSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['officeHoursSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['officeHoursSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['officeHoursSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['officeHoursSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
    },
  });
}

// School Hours Section CRUD
export function useGetAllSchoolHoursSections() {
  const { actor, isFetching } = useActor();

  return useQuery<SchoolHoursSection[]>({
    queryKey: ['schoolHoursSections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllSchoolHoursSections();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['schoolHoursSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['schoolHoursSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['schoolHoursSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['schoolHoursSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['schoolHoursSections'] });
      queryClient.invalidateQueries({ queryKey: ['citizenCharterContactInfo'] });
      await new Promise(resolve => setTimeout(resolve, 300));
      await queryClient.refetchQueries({ queryKey: ['schoolHoursSections'], type: 'active' });
      await queryClient.refetchQueries({ queryKey: ['citizenCharterContactInfo'], type: 'active' });
    },
  });
}

export function useGetAlumniContent() {
  const { actor, isFetching } = useActor();

  return useQuery<AlumniContent>({
    queryKey: ['alumniContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAlumniContent();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['alumniContent'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['alumniContent'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Alumni content update error:', error);
      throw error;
    },
  });
}

export function useGetAlumniProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<AlumniProfile[]>({
    queryKey: ['alumniProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAlumniProfiles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['alumniProfiles'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Alumni profile create error:', error);
      throw error;
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['alumniProfiles'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Alumni profile update error:', error);
      throw error;
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['alumniProfiles'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('Alumni profile delete error:', error);
      throw error;
    },
  });
}

export function useGetBNHSHymnVideo() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['bnhsHymnVideo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getBNHSHymnVideo();
      } catch (error: any) {
        if (error.message?.includes('not found')) {
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

export function useUploadBNHSHymnVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoFile: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.setBNHSHymn(videoFile);
        return { success: true };
      } catch (error: any) {
        console.error('Backend upload error:', error);
        throw new Error(error.message || 'Failed to upload video to backend');
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['bnhsHymnVideo'] });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await queryClient.refetchQueries({ queryKey: ['bnhsHymnVideo'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('BNHS Hymn video upload error:', error);
      throw error;
    },
    retry: 1,
  });
}

export function useRemoveBNHSHymnVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeBNHSHymn();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['bnhsHymnVideo'] });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await queryClient.refetchQueries({ queryKey: ['bnhsHymnVideo'], type: 'active' });
    },
    onError: (error: any) => {
      console.error('BNHS Hymn video remove error:', error);
      throw error;
    },
  });
}

// DepEd Mission Content
export function useGetDepEdMission() {
  const { actor, isFetching } = useActor();

  return useQuery<DepEdMissionContent | null>({
    queryKey: ['depedMission'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getDepEdMission();
      } catch (error: any) {
        if (error.message?.includes('not found')) {
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

export type { BannerImage, BannerFileMetadata, SliderImage, HeritageSectionContent, FormattedText, CitizenCharterBackground, CitizenCharterStaticImage, AlumniContent, AlumniProfile, AdminUserData, AdminPermission, UserProfile, AnalyticsPeriod, LoginRecord, StorageStats, FileTypeBreakdown, ContactInfoSection, OfficeHoursSection, SchoolHoursSection, DepEdMissionContent, OrganizationalStructureContent };
