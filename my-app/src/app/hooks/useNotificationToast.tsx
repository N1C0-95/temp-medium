import { useId, useToastController, ToastPosition } from "@fluentui/react-components";
import NotificationToast from "../shared/components/core/NotificationToast";


export function useNotificationToast(defaultPosition: ToastPosition = "top") {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notify = (title: string, body: string, intent: "success" | "error" |"info" = "success") => {
    dispatchToast(
      <NotificationToast title={title} body={body} />,
      { position: defaultPosition, intent }
    );
  };

  return { toasterId, notify }
}