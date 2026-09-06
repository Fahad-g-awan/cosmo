import { IconType } from "react-icons";

export interface FeatureDetailsType {
  id: number;
  image: string;
  Icon?: IconType;
  title: string;
  keypoints: string[];
  description?: string;
}
