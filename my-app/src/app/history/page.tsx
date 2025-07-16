"use client";

import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
  Toaster,
} from "@fluentui/react-components";
import { DeleteRegular, OpenRegular } from "@fluentui/react-icons";
import {
  useAzureDeleteHistoryEntity,
  useAzureGetHistoryEntityByUserId,
} from "../hooks/useAzureTable";
import { ServerError } from "../shared/components/core/ServerError";
import { Spinner } from "../shared/components/core/Spinner";
import { HistoryEntity } from "@/models/response/history-entity";
import { useEffect, useState } from "react";
import { useNotificationToast } from "../hooks/useNotificationToast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import NotFound from "../not-found";
import { useConfigStore } from "../store/configStore";

export default function HistoryPage() {
  const deleteMutation = useAzureDeleteHistoryEntity();

  const router = useRouter();

  const { data: session, status } = useSession();



  const [continuationToken, setContinuationToken] = useState<string | null>(
    null
  );
  const [lastContinuationToken, setLastContinuationToken] = useState<
    string | null
  >(null);
  const [history, setHistory] = useState<HistoryEntity[]>([]);

  const { data, refetch, isFetching, error } = useAzureGetHistoryEntityByUserId(
    session?.user?.id || "",
    continuationToken ?? undefined,
    { enabled: !!session?.user?.id }
  );



  useEffect(() => {
    if (data) {
      setHistory((prev) =>
        continuationToken ? [...prev, ...data.entities] : data.entities
      );
      setLastContinuationToken(data?.continuationToken || null);
    }
  }, [data]);

  // -----------------------
  // Redirect unauthenticated users
  // -----------------------
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // state for dialog and selected keys
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<{
    partitionKey: string;
    rowKey: string;
  } | null>(null);

  // -----------------------
  // Notification Toast
  // -----------------------

  const { toasterId, notify } = useNotificationToast();

  const handleDelete = async (partitionKey: string, rowKey: string) => {
    try {
      await deleteMutation.mutateAsync({ partitionKey, rowKey });
      refetch();
      setDialogOpen(false);
      notify(
        "Translated text deleted",
        "The translated text has been deleted successfully.",
        "success"
      );
    } catch (err) {
      notify(
        "Error deleting text",
        "Failed to delete the translated text.",
        "error"
      );
    }
  };

  // -----------------------
  // Utility Functions
  // -----------------------
  function truncateText(text: string, maxLength: number) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
  }

  const isHistoryEnabled = useConfigStore((state) => state.config?.isHistoryEnabled);
  // -----------------------
  // UI Rendering
  // -----------------------
  return (
    <>
    
      {isFetching && (
        <div className="page">
          <Spinner />
        </div>
      )}
      {error && ServerError({ type: "error", message: error.message })}

      {!isHistoryEnabled && !isFetching && <NotFound/>}

      {data && !isFetching && isHistoryEnabled &&(
        <div className="page flex flex-col gap-2">
          <Toaster toasterId={toasterId} />

          <Dialog
            open={dialogOpen}
            onOpenChange={(_, data) => setDialogOpen(data.open)}
          >
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                  Are you sure you want to delete this record? This action
                  cannot be undone.
                </DialogContent>
                <DialogActions>
                  <Button
                    appearance="secondary"
                    onClick={() => setDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={() => {
                      if (selectedKeys) {
                        handleDelete(
                          selectedKeys.partitionKey,
                          selectedKeys.rowKey
                        );
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>

          <Title1 className="text-2xl font-bold">History</Title1>

          <Card>
            <Table className="w-full ">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>
                    <b>Source</b>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <b>Target</b>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <b>Source</b>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <b>Modified</b>
                  </TableHeaderCell>
                  <TableHeaderCell /> {/* edit Column */}
                </TableRow>
              </TableHeader>
            </Table>
            
            <div className="overflow-y-auto h-96">
              <Table>
                <TableBody>
                  {history
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp!).getTime() -
                        new Date(a.timestamp!).getTime()
                    )
                    .map((item: HistoryEntity) => (
                      <TableRow key={item.rowKey}>
                        <TableCell>{item.SourceLang.toUpperCase()}</TableCell>
                        <TableCell>{item.TargetLang.toUpperCase()}</TableCell>
                        <TableCell>
                          {truncateText(item.SourceText, 50)}
                        </TableCell>
                        <TableCell>
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end ">
                            <Button
                              icon={<OpenRegular />}
                              appearance="subtle"
                              onClick={() => {
                                router.push(
                                  `/?historyId=${item.partitionKey}|${item.rowKey}`
                                );
                              }}
                            />
                            <Button
                              icon={<DeleteRegular />}
                              appearance="subtle"
                              onClick={() => {
                                setSelectedKeys({
                                  partitionKey: item.partitionKey,
                                  rowKey: item.rowKey,
                                });
                                setDialogOpen(true);
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {data.continuationToken &&
          <div className="flex justify-center mt-4">
            <Button
              appearance="subtle"
              onClick={() => {
                setContinuationToken(data?.continuationToken || null);
              }}
              disabled={!data?.continuationToken || isFetching}
            >
              Load More
            </Button>
          </div>
          }
        </div>
      )}
    </>
  );
}
