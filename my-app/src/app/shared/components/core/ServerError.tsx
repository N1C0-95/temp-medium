import {
  MessageBar,
  MessageBarBody

} from "@fluentui/react-components";


interface ServerErrorProps {
  message: string;
  type: "success" | "warning" | "info" | "error";

}




export function ServerError(props: ServerErrorProps) {



  return (
    <>   
       
      <MessageBar intent={props.type}>
        <MessageBarBody>
          {props.message || "Server Error Occurs !"}
        </MessageBarBody>
      </MessageBar>
    </>
  );
}
