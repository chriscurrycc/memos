import { create } from "zustand";
import { combine } from "zustand/middleware";
import { resourceServiceClient } from "@/grpcweb";
import { CreateResourceRequest, Resource, UpdateResourceRequest } from "@/types/proto/api/v1/resource_service";

interface State {
  resourceMapByName: Record<string, Resource>;
  resourceList: Resource[];
}

const getDefaultState = (): State => ({
  resourceMapByName: {},
  resourceList: [],
});

export const useResourceStore = create(
  combine(getDefaultState(), (set, get) => ({
    setState: (state: State) => set(state),
    getState: () => get(),
    fetchResources: async () => {
      const { resources } = await resourceServiceClient.listResources({});
      const resourceMap = get().resourceMapByName;
      resources.forEach((resource) => {
        resourceMap[resource.name] = resource;
      });
      set({ resourceMapByName: resourceMap, resourceList: resources });
      return resources;
    },
    fetchResourceByUID: async (uid: string) => {
      const resource = await resourceServiceClient.getResourceByUid({
        uid,
      });
      const resourceMap = get().resourceMapByName;
      resourceMap[resource.name] = resource;
      set({ resourceMapByName: resourceMap });
      return resource;
    },
    getResourceByName: (name: string) => {
      const resourceMap = get().resourceMapByName;
      return Object.values(resourceMap).find((r) => r.name === name);
    },
    async createResource(create: CreateResourceRequest): Promise<Resource> {
      const resource = await resourceServiceClient.createResource(create);
      const resourceMap = get().resourceMapByName;
      resourceMap[resource.name] = resource;
      const resourceList = [...get().resourceList, resource];
      set({ resourceMapByName: resourceMap, resourceList });
      return resource;
    },
    async updateResource(update: UpdateResourceRequest): Promise<Resource> {
      const resource = await resourceServiceClient.updateResource(update);
      const resourceMap = get().resourceMapByName;
      resourceMap[resource.name] = resource;
      const resourceList = get().resourceList.map((r) => (r.name === resource.name ? resource : r));
      set({ resourceMapByName: resourceMap, resourceList });
      return resource;
    },
    async deleteResource(name: string): Promise<void> {
      await resourceServiceClient.deleteResource({ name });
      const resourceMap = get().resourceMapByName;
      delete resourceMap[name];
      const resourceList = get().resourceList.filter((r) => r.name !== name);
      set({ resourceMapByName: resourceMap, resourceList });
    },
  })),
);
