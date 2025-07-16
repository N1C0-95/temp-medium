import {Toast, ToastBody, ToastTitle } from "@fluentui/react-components";

export interface ToastProps {
  title: string;
  subtitle?: string;
  body: string;
}

export default function NotificationToast(props: ToastProps) {
  return (
    <>
      <Toast appearance="inverted">
        <ToastTitle>{props.title}</ToastTitle>
      </Toast>,
    </>
  );
}
