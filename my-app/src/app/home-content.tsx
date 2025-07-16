"use client";
import { useDropzone, FileWithPath } from "react-dropzone";
import {
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from "react-icons/fa";

import {
  useAzureDetectLanguage,
  useAzureLanguageAvailable,
  useAzureTranslateText,
} from "./hooks/useAzureTranslateText";
import {
  Textarea,
  useComboboxFilter,
  ComboboxProps,
  Combobox,
  Card,
  Button,
  Title1,
  Text,
  Toaster,
  Field,
  ProgressBar,
  CardHeader,
  Body1Strong,
  OptionGroup,
  Option,
  Skeleton,
  SkeletonItem,
  Tooltip,
  Body1,
  TabList,
  Tab,
  InfoLabel
} from "@fluentui/react-components";

import {
  CopyRegular,
  ArrowSwapRegular,
  TranslateAutoRegular,
  DocumentRegular,
  TextAlignLeftRegular
} from "@fluentui/react-icons";


import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Spinner } from "./shared/components/core/Spinner";
import SynonymSelector from "./shared/components/SynonymSelector";
import { useNotificationToast } from "./hooks/useNotificationToast";
import { AzureTranslatorResult } from "@/models/response/azuretranslator-response";
import {
  useGptRephrasings,
  useGptRephrasingsFromSynonym,
} from "./hooks/useGptModel";
import {
  useAzureCreateHistoryEntity,
  useAzureGetHistoryEntityById,
  useAzureUpdateHistoryEntity,
} from "./hooks/useAzureTable";
import { useConfigStore } from "./store/configStore";

import { v4 as uuidv4 } from "uuid";

// =======================
// Home Page Component
// =======================

export default function HomeContent() {
  const [translatedTextResult, setTranslatedTextResult] = useState<string>("");

  const config = useConfigStore((state) => state.config);
  // -----------------------
  // Auth & Routing
  // -----------------------

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract partitionKey and rowKey from search params
  // This is useful for fetching specific history entries or other data
  const historyIdParams = searchParams.get("historyId")?.split("|") ?? [];

  const [partitionKey, setPartitionKey] = useState<string | null>(
    historyIdParams ? historyIdParams[0] : null
  );
  const [rowKey, setRowKey] = useState<string | null>(
    historyIdParams ? historyIdParams[1] : null
  );

  // -----------------------
  // State for Text & Debounce
  // -----------------------
  const [textToTranslate, setTextToTranslate] = useState<string>("");
  const [debouncedText, setDebouncedText] = useState<string>("");

  // -----------------------
  // State for Comboboxes
  // -----------------------
  const [fromQuery, setFromQuery] = useState<string>("");
  const [fromSelectedLanguage, setFromSelectedLanguage] = useState<string>("");
  const [toSelectedLanguage, setToSelectedLanguage] = useState<string>("");
  const [toQuery, setToQuery] = useState<string>("");

  // -----------------------
  // Fetch available languages
  // -----------------------

  const [languageAvailableRetrived, setLanguageAvailableRetrieved] =
    useState<boolean>(false);
  const {
    data: languageAvailable,
    isLoading: languageLoading,
    error: languageError,
  } = useAzureLanguageAvailable("en", {
    enabled: !languageAvailableRetrived,
  });

  useEffect(() => {
    if (languageAvailable && !languageError) {
      setLanguageAvailableRetrieved(true);
    }
  }, [languageAvailable]);

  // prepare language options for the combobox
  const languageOptions = languageAvailable
    ? Object.entries(languageAvailable.translation).map(([code, obj]) => ({
        optionText: obj.name,
        optionValue: code,
        value: obj.name,
        children: obj.name,
      }))
    : [];

  // Filtered options for FROM and TO comboboxes
  const fromFilteredOptions = useComboboxFilter(fromQuery, languageOptions, {
    noOptionsMessage: "No Languge Found",
  });
  const toFilteredOptions = useComboboxFilter(toQuery, languageOptions, {
    noOptionsMessage: "No Languge Found",
  });

  // -----------------------
  // Combobox Handlers
  // -----------------------

  const onFromOptionSelect: ComboboxProps["onOptionSelect"] = (e, data) => {
    // Set the selected language code to fromSelectedLanguage
    const selectedFromLanguage = languageOptions.find(
      (option) => option.optionText === data.optionText
    )?.optionValue;

    setFromSelectedLanguage(selectedFromLanguage ? selectedFromLanguage : "en");
    setFromQuery(data.optionText ?? "");
  };
  const onToOptionSelect: ComboboxProps["onOptionSelect"] = (e, data) => {
    if (!data.optionText) return;

    const selectedToLanguage = languageOptions.find(
      (option) => option.optionText === data.optionText
    )?.optionValue;

    if (!selectedToLanguage) return;

    setToSelectedLanguage(selectedToLanguage ? selectedToLanguage : "en");
    setToQuery(data.optionText ?? "");

    //Force debounce to restart translation
    setLastTranslatedText("");
  };

  // -----------------------
  // Debounce Effect for Translation
  // -----------------------

  useEffect(() => {
    if (textToTranslate.length > 0) {
      const timer = setTimeout(() => {        
        setDebouncedText(textToTranslate);
      }, 350); // Adjust the delay as needed

      return () => clearTimeout(timer); 
    }
  }, [textToTranslate]);

  // -----------------------
  // Redirect unauthenticated users
  // -----------------------
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const { data: historyEntityDetail, isLoading: historyEntityDetailLoading } =
    useAzureGetHistoryEntityById(partitionKey!, rowKey!, {
      enabled: !!partitionKey && !!rowKey,
    });

  useEffect(() => {
    if (historyEntityDetail) {
      const selctedSourceLanguage = languageOptions.find(
        (option) => option.optionValue === historyEntityDetail.SourceLang
      )?.optionText;
      const selctedTargetLanguage = languageOptions.find(
        (option) => option.optionValue === historyEntityDetail.TargetLang
      )?.optionText;

      setTextToTranslate(historyEntityDetail.SourceText);
      setFromSelectedLanguage(historyEntityDetail.SourceLang);
      setToSelectedLanguage(historyEntityDetail.TargetLang);
      setFromQuery(selctedSourceLanguage ? selctedSourceLanguage : "");
      setToQuery(selctedTargetLanguage ? selctedTargetLanguage : "");
    }
  }, [historyEntityDetail]);

  // -----------------------
  // Translation & Language Detection Hooks
  // -----------------------

  const [lastTranslatedText, setLastTranslatedText] = useState<string>("");

  const shouldTranslate =
    !!debouncedText &&
    debouncedText != lastTranslatedText &&
    !!toSelectedLanguage &&
    !!fromSelectedLanguage;

  const {
    data: translatedText,
    isLoading: translatedTextLoading,
    error: translatedTextError,
  } = useAzureTranslateText(
    debouncedText,
    toSelectedLanguage,
    fromSelectedLanguage,    
    {
      enabled: shouldTranslate,
    }
  );

  const {
    data: detectedLanguage,
    isLoading: detectedLanguageLoading,
    error: detectedLanguageError,
  } = useAzureDetectLanguage(debouncedText, {
    enabled: !fromSelectedLanguage && debouncedText.length > 0,
  });

  //set language detection result
  const [languageDetected, setLanguageDetected] = useState<boolean>(false);
  const [dbTextToSave, setDbTextToSave] = useState<string>("");

  useEffect(() => {

    //Reset only if the user manually clears the text
    if (textToTranslate.length === 0) {
      setFromSelectedLanguage("");
      setFromQuery("");
      setLanguageDetected(false);
      setToSelectedLanguage("");
      setToQuery("");
      setTranslatedTextResult("");
    }
  }, [textToTranslate]);

  // -----------------------
  // Debounce Effect for DB Save
  // -----------------------

  useEffect(() => {
    if (translatedTextResult.length === 0) return;
    const timer = setTimeout(() => {
      setDbTextToSave(translatedTextResult);
    }, 2000);
    return () => clearTimeout(timer);
  }, [translatedTextResult]);

  // Save to DB only when dbTextToSave changes and the text is different from the last saved
  useEffect(() => {
    if(config?.isHistoryEnabled === false) return;
    
    if (!dbTextToSave || lastTranslatedText === dbTextToSave) return;   

    const body = {
      partitionKey: session?.user?.id!,
      rowKey: !!rowKey ? rowKey : uuidv4(),
      SourceLang: fromSelectedLanguage,
      TargetLang: toSelectedLanguage,
      SourceText: textToTranslate,
    };

    if (rowKey) {      
      updateMutation.mutate({ data: body });      
    } else {      
      createMutation.mutate({ data: body });
      setPartitionKey(body.partitionKey); 
      setRowKey(body.rowKey); 
    }

  }, [dbTextToSave]);

  const createMutation = useAzureCreateHistoryEntity();
  const updateMutation = useAzureUpdateHistoryEntity();

  useEffect(() => {
    if (
      detectedLanguage &&
      !languageDetected &&
      textToTranslate &&
      !fromSelectedLanguage
    ) {
      const selectedFromLanguage = languageOptions.find(
        (option) => option.optionValue === detectedLanguage
      );
      setFromSelectedLanguage(
        selectedFromLanguage ? selectedFromLanguage.optionValue : ""
      );
      setFromQuery(selectedFromLanguage ? selectedFromLanguage.optionText : "");
      setLanguageDetected(true);
    }
  }, [detectedLanguage, languageDetected, debouncedText, fromSelectedLanguage]);

  // -----------------------
  // Translation & Language Detection Hooks
  // -----------------------
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedTextResult);
      notify(
        "Text copied to clipboard!",
        "The translated text has been copied successfully.",
        "success"
      );
    } catch (err) {
      notify(
        "Error copying text",
        "Failed to copy the translated text.",
        "error"
      );
    }
  };

  // -----------------------
  // Notification Toast
  // -----------------------

  const { toasterId, notify } = useNotificationToast();

  //-----------------------
  // Utility functions
  //-----------------------

  // Function to get the translated text from the response
  function getTranslatedText(translatedText: AzureTranslatorResult[]): string {
    return translatedText
      ? translatedText[0]?.translations?.map((t) => t.text).join(" ") ?? ""
      : "";
  }

  // -----------------------
  // Gpt Model Service
  // -----------------------

  const [synonymSelected, setSynonymSelected] = useState<string>("");
  const [wordSelected, setWordSelected] = useState<string>("");
  const [indexWordSelected, setIndexWordSelected] = useState<number>(0);

  const [originalTranslatedText, setOriginalTranslatedText] =
    useState<string>("");

  const {
    data: rephrasingResult,
    isLoading,
    error,
  } = useGptRephrasingsFromSynonym(
    originalTranslatedText,
    wordSelected ?? "",
    indexWordSelected ?? 0,
    synonymSelected,
    {
      enabled: !!synonymSelected,
    }
  );

  const {
    data: alternativePhrasingResult,
    refetch: refetchAlternatives,
    isLoading: alternativePhraseIsLoading,
  } = useGptRephrasings(translatedTextResult, 5, {
    enabled: false,
  });

  useEffect(() => {
    if (translatedTextResult) {
      refetchAlternatives();
    }
  }, [translatedTextResult]);

  // Quando arriva una nuova traduzione da Azure, aggiorna lo stato centrale
  useEffect(() => {
    if (translatedText?.[0].translations && translatedText?.[0].translations.length > 0) {
      const cleanText = getTranslatedText(translatedText);
      setTranslatedTextResult(cleanText);
      setOriginalTranslatedText(cleanText);
      setLastTranslatedText(textToTranslate);

      // Aggiorna lo stato centrale con partitionKey e rowKey
      
    }
  }, [translatedText]);
  // Quando selezioni un'alternativa, aggiorna lo stato centrale
  const handleAlternativeSelect = (phrase: string) => {
    setTranslatedTextResult(phrase);
  };

  // Quando selezioni un sinonimo, aggiorna lo stato centrale
  const handleSynonymSelect = (
    word: string,
    index: number,
    synonym: string
  ) => {
    setSynonymSelected(synonym);
    setWordSelected(word);
    setIndexWordSelected(index);
    // Quando arriva la nuova frase riformulata da GPT, aggiorna lo stato centrale
    // (aggiungi un useEffect per rephrasingResult)
  };

  useEffect(() => {
    // Reset selezione sinonimo/parola ogni volta che cambia la traduzione
    setSynonymSelected("");
    setWordSelected("");
    setIndexWordSelected(0);
  }, [translatedTextResult]);

  useEffect(() => {
    if (rephrasingResult && rephrasingResult.rephrasings.length > 0) {
      setTranslatedTextResult(rephrasingResult.rephrasings[0]);
    }
  }, [rephrasingResult]);

  const maxLength = config?.maxInputCharactersTextTranslate ?? 1000;

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setTextToTranslate(value);
    if (value.length === maxLength) {
      notify(
        `Maximum length characters exceeded.`,
        `Maximum length of ${maxLength} characters exceeded.`,
        "error"
      );
    }
  }
  function handleResetNewTranslation() {
    setTextToTranslate("");
    setTranslatedTextResult("");
    setFromSelectedLanguage("");
    setToSelectedLanguage("");
    setFromQuery("");
    setToQuery("");
    setPartitionKey(null);
    setRowKey(null);
    setLastTranslatedText("");
    setDbTextToSave("");
    setLanguageDetected(false);
  }

  // -----------------------
  // Upload Document
  // -----------------------
  const [file, setFile] = useState<File | null>(null);
  

  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const saveFile = async (data: Blob, filename: string) => {
    const downloadUrl = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `translated_${filename}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("document", file);
    formData.append("targetLanguage", toSelectedLanguage); 

    try {
      const res = await fetch("/api/translate-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Errore durante la traduzione");
      const blobData = await res.blob();
      await saveFile(blobData, file.name);
    } catch (err) {
      alert("Errore: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const [tabSelected, setTabSelected] = useState<string>("tab1");

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],      
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/xliff+xml": [".xlf", ".xliff"],
      "application/vnd.ms-outlook": [".msg"],
      "application/x-mimearchive": [".mhtml", ".mht"],
      "text/html": [".html", ".htm"],
      "text/tab-separated-values": [".tsv"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    onDropRejected: (fileRejections) => {
      notify(
        "File type not supported",
        "Only .docx, .xlsx, .pptx, .txt and csv files are allowed.",
        "error"
      );
    }

  });

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-600 inline mr-2" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-600 inline mr-2" />;
      case "ppt":
      case "pptx":
        return <FaFilePowerpoint className="text-orange-600 inline mr-2" />;
      default:
        return <FaFileAlt className="text-gray-500 inline mr-2" />;
    }
  };

  const files = acceptedFiles.map((file: FileWithPath) => {
    const name = file.name || file.path || "";
    return (
      <li
        key={file.path}
        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-blue-100 transition"
      >
        {getFileIcon(name)}
        <span className="truncate">{name.replace(/^.*[\\/]/, "")}</span>
        
        
      </li>
    );
  });


 
    const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  
  // -----------------------
  // UI Rendering
  // -----------------------

  // Show spinner while session is loading
  if (status === "loading")
    return (
      <div className="page pt-12 flex flex-col ">
        <Spinner />
      </div>
    );

  // Prevent rendering if not authenticated
  if (!session) return null;

  return (
    <>
    
          
    <div className="page z-10">
      <div className="flex flex-col gap-2 justify-between">
        
        <Toaster toasterId={toasterId} />
        <Title1 className="text-blue-950 mb-4">Translate</Title1>
        <TabList
          defaultSelectedValue="tab1"
          defaultChecked
          size="small"
          as="div"
          onTabSelect={(_event, data) => setTabSelected(data.value as string)}
        >
          <Tab value="tab1" icon={<TextAlignLeftRegular />}>
            Text
          </Tab>
          <Tab value="tab2" icon={<DocumentRegular />}>
            {" "}
            Document
          </Tab>
        </TabList>

        {tabSelected === "tab1" && (
          <>
            {" "}
            <Text className="text-lg text-blue-950">
              Enter the text to be translated and select the target language.
            </Text>
            <div
              id="header"
              className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap sm:justify-center items-center mt-2"
            >
              <Combobox
                onOptionSelect={onFromOptionSelect}
                placeholder="Select a Language"
                onChange={(ev) => setFromQuery(ev.target.value)}
                value={fromQuery}
              >
                {fromFilteredOptions}
              </Combobox>
              <Button
                appearance="subtle"
                icon={<ArrowSwapRegular />}
                aria-label="Change Language"
                onClick={() => {
                  const prevFromLang = fromSelectedLanguage;
                  const prevToLang = toSelectedLanguage;
                  const prevFromQuery = fromQuery;
                  const prevToQuery = toQuery;

                  setFromSelectedLanguage(prevToLang);
                  setToSelectedLanguage(prevFromLang);

                  setFromQuery(prevToQuery);
                  setToQuery(prevFromQuery);
                  
                  setTextToTranslate(translatedTextResult);
                  setTranslatedTextResult("");
                }}
              />
              <Combobox
                onOptionSelect={onToOptionSelect}
                placeholder="Select a Language"
                onChange={(ev) => setToQuery(ev.target.value)}
                value={toQuery}
              >
                <OptionGroup label="Frequently Used">
                  {toFilteredOptions
                    .filter((option) =>
                      config?.languageFrequentlyUsed.includes(
                        option.props.optionValue
                      )
                    )
                    .map((option) => (
                      <Option key={option.key}>{option.props.children}</Option>
                    ))}
                </OptionGroup>
                <OptionGroup label="Other Languages">
                  {toFilteredOptions
                    .filter(
                      (option) =>
                        !config?.languageFrequentlyUsed.includes(
                          option.props.optionValue
                        )
                    )
                    .map((option) => (
                      <Option key={option.key}>{option.props.children}</Option>
                    ))}
                </OptionGroup>
              </Combobox>

              <br />
            </div>
            <div className="flex justify-between gap-4 flex-row h-50 ">
              <Card className="w-1/2 h-48 relative">
                <Textarea
                  className="w-full h-full"
                  appearance="filled-lighter"
                  maxLength={maxLength}
                  onChange={handleTextChange}
                  size="medium"
                  placeholder="type here..."
                  value={textToTranslate}
                />
              </Card>

              <Card className="w-1/2 h-48">
                <SynonymSelector
                  sentence={translatedTextResult}
                  onSynonymSelected={(word, index, synonym) => {
                    handleSynonymSelect(word, index, synonym);
                  }}
                />
                <Button
                  appearance="subtle"
                  icon={<CopyRegular />}
                  aria-label="copy text"
                  onClick={() => handleCopy()}
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 1,
                    zIndex: 1,
                  }}
                />
                {translatedTextLoading && (
                  <Field
                    validationState="none"
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 1,
                      right: 1,
                    }}
                  >
                    <ProgressBar />
                  </Field>
                )}
              </Card>
            </div>
            {!!translatedTextResult && (
              <>
                <div className="flex justify-center">
                  <Button
                    icon={<TranslateAutoRegular />}
                    appearance="subtle"
                    onClick={() => {
                      handleResetNewTranslation();
                    }}
                  >
                    New Translation
                  </Button>
                </div>
                <Card className="w-full h-64">
                  <CardHeader
                    header={<Body1Strong>Alternatives</Body1Strong>}
                  />

                  {alternativePhraseIsLoading && (
                    <div className="flex flex-col gap-4 ">
                      <Skeleton aria-label="Loading Content">
                        <SkeletonItem size={28} />
                      </Skeleton>
                      <Skeleton aria-label="Loading Content">
                        <SkeletonItem size={28} />
                      </Skeleton>
                      <Skeleton aria-label="Loading Content">
                        <SkeletonItem size={28} />
                      </Skeleton>
                    </div>
                  )}

                  {!alternativePhraseIsLoading &&
                    !translatedTextLoading &&
                    alternativePhrasingResult && (
                      <div className="flex flex-col gap-1">
                        {alternativePhrasingResult.rephrasings.map(
                          (phrase, index) => (
                            <Card
                              className="w-full"
                              appearance="subtle"
                              size="small"
                              key={index}
                              onClick={() => {
                                handleAlternativeSelect(phrase);
                              }}
                            >
                              <Tooltip content={phrase} relationship="label">
                                <div
                                  style={{
                                    maxWidth: "100%",
                                    width: "100%",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Body1
                                    truncate
                                    style={{
                                      maxWidth: "100%",
                                      width: "100%",
                                      display: "block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {phrase}
                                  </Body1>
                                </div>
                              </Tooltip>
                            </Card>
                          )
                        )}
                      </div>
                    )}
                </Card>
              </>
            )}
          </>
        )}

        {tabSelected === "tab2" && (
          <>
            <div className="flex gap-2 justify-between items-center">
              <InfoLabel
                info={
                  <>
                    <Text>
                      Supported formats: .docx, .xlsx, .pptx, .txt, .csv, .txv, .tab, .html, .htm, .mhtml, .mht, .msg, .xlf and
.xliff	. The
                      translated file will be downloaded automatically.
                    </Text>
                  </>
                }
              >
                Select a file and translate it.
              </InfoLabel>
              <Combobox
                onOptionSelect={onToOptionSelect}
                placeholder="Select a Language"
                onChange={(ev) => setToQuery(ev.target.value)}
                value={toQuery}
              >
                <OptionGroup label="Frequently Used">
                  {toFilteredOptions
                    .filter((option) =>
                      config?.languageFrequentlyUsed.includes(
                        option.props.optionValue
                      )
                    )
                    .map((option) => (
                      <Option key={option.key}>{option.props.children}</Option>
                    ))}
                </OptionGroup>
                <OptionGroup label="Other Languages">
                  {toFilteredOptions
                    .filter(
                      (option) =>
                        !config?.languageFrequentlyUsed.includes(
                          option.props.optionValue
                        )
                    )
                    .map((option) => (
                      <Option key={option.key}>{option.props.children}</Option>
                    ))}
                </OptionGroup>
              </Combobox>
            </div>
            
            <section className="container" >
              <div 
                {...getRootProps({
                  className:
                    "border-2 border-dashed rounded-lg p-8 text-center text-blue-700 bg-blue-50 cursor-pointer",
                })}
              >
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
              <aside>
                <ul>
                  <Text>{files}</Text>
                </ul>
              </aside>
              <div className="flex justify-center mt-4">
                <Button
                  appearance="subtle"
                  onClick={handleUpload}
                  disabled={uploading || acceptedFiles.length === 0 || !toSelectedLanguage}
                >
                  {uploading ? "Loading..." : "Translate Document"}
                </Button>
              </div>
              {uploading && (
                <Skeleton aria-label="Loading Content">
                  <SkeletonItem size={12} />
                </Skeleton>
              )}
            </section>
          </>
        )}
      </div>
    </div>
    
    </>
  );
}


