import { memo } from "react";
import { PhotoView } from "react-photo-view";
import { Resource } from "@/types/proto/api/v1/resource_service";
import { getResourceType, getResourceUrl } from "@/utils/resource";
import MemoResource from "./MemoResource";

const MemoResourceListView = ({ resources = [] }: { resources: Resource[] }) => {
  const imageResources: Resource[] = [];
  const videoResources: Resource[] = [];
  const otherResources: Resource[] = [];

  resources.forEach((resource) => {
    const type = getResourceType(resource);
    if (type === "image/*") {
      imageResources.push(resource);
    } else if (type === "video/*") {
      videoResources.push(resource);
    } else {
      otherResources.push(resource);
    }
  });

  return (
    <>
      {imageResources.length > 0 && (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {imageResources.map((resource) => {
            const resourceUrl = getResourceUrl(resource);
            return (
              <PhotoView key={resource.name} src={resourceUrl}>
                <img
                  className="h-[15rem] object-contain cursor-pointer"
                  src={resource.externalLink ? resourceUrl : resourceUrl + "?thumbnail=true"}
                  decoding="async"
                  loading="lazy"
                />
              </PhotoView>
            );
          })}
        </div>
      )}
      {videoResources.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {videoResources.map((resource) => (
            <video
              key={resource.name}
              className="w-full max-h-[15rem] object-contain bg-zinc-100 dark:bg-zinc-800 rounded"
              preload="metadata"
              crossOrigin="anonymous"
              src={getResourceUrl(resource)}
              controls
            />
          ))}
        </div>
      )}
      {otherResources.length > 0 && (
        <div className="w-full flex flex-row justify-start flex-wrap gap-2">
          {otherResources.map((resource) => (
            <MemoResource key={resource.name} resource={resource} />
          ))}
        </div>
      )}
    </>
  );
};

export default memo(MemoResourceListView);
