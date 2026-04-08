import { PhotoView } from "react-photo-view";

interface Props {
  altText: string;
  url: string;
}

const Image = ({ altText, url }: Props) => {
  return (
    <PhotoView src={url}>
      <img
        src={url}
        alt={altText}
        decoding="async"
        loading="lazy"
        className="h-[15rem] object-contain cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    </PhotoView>
  );
};

export default Image;
