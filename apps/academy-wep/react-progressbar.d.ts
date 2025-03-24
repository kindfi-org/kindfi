declare module "react-progressbar" {
  import { Component } from "react";

  interface ProgressBarProps {
    completed: number;
    className?: string;
    bgcolor?: string;
  }

  export default class ProgressBar extends Component<ProgressBarProps> {}
}
