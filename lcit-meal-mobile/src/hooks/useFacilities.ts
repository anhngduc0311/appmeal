import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { facilityService } from '../services/facilityService';
import type { FacilityId, FacilityPerson } from '../utils/facilities';

export function useFacilities() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['local-facilities', isMockMode];
  const query = useQuery({ queryKey, queryFn: () => facilityService.load(isMockMode) });
  const assignment = useMutation({
    mutationFn: ({ person, facilityId }: { person: FacilityPerson; facilityId: FacilityId | null }) =>
      facilityService.assign(person, facilityId, isMockMode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  return { overrides: query.data || {}, isLoading: query.isLoading, assignment };
}
