"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, Button, Badge, Table, Thead, Tbody, Th, Td, LoadingSpinner, EmptyState, ProgressBar } from "@/components/ui";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface ImportBatch {
  id: string;
  fileName: string;
  status: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  createdAt: string;
  uploadedBy: { name: string };
}

type UploadStatus = "idle" | "uploading" | "processing" | "completed";

export default function ImportsPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  async function fetchBatches() {
    const res = await fetch("/api/imports");
    const data = await res.json();
    if (data.success) setBatches(data.data);
    setLoading(false);
  }

  function uploadImportFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("file", file);
      xhr.open("POST", "/api/imports");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        // Keep real transfer progress in the first 70%, then reserve 30% for server-side processing.
        const transferProgress = (event.loaded / event.total) * 70;
        setUploadProgress((current) => Math.max(current, Math.min(70, transferProgress)));
      };

      xhr.upload.onload = () => {
        setUploadStatus("processing");
        setUploadProgress((current) => Math.max(current, 70));
      };

      xhr.onerror = () => {
        reject(new Error("Upload failed"));
      };

      xhr.onload = () => {
        try {
          const parsed = JSON.parse(xhr.responseText || "{}");

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(parsed);
            return;
          }

          reject(new Error(parsed.error || "Upload failed"));
        } catch {
          reject(new Error("Invalid response from server"));
        }
      };

      xhr.send(formData);
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(5);
    setUploadStatus("uploading");
    setUploadResult(null);

    const processingTicker = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current < 70) return current;
        if (current >= 95) return current;
        return current + 2;
      });
    }, 350);

    try {
      const data = await uploadImportFile(file);
      setUploadProgress((current) => Math.max(current, 85));
      setUploadResult(data);
      if (data.success) {
        setUploadStatus("completed");
        setUploadProgress(100);
        fetchBatches();
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      window.clearInterval(processingTicker);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "PARTIAL_SUCCESS": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "FAILED": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <FileSpreadsheet className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Badge variant="success">Completed</Badge>;
      case "PARTIAL_SUCCESS": return <Badge variant="warning">Partial</Badge>;
      case "FAILED": return <Badge variant="danger">Failed</Badge>;
      case "PROCESSING": return <Badge variant="info">Processing</Badge>;
      default: return <Badge>Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-gray-700">Upload Excel files to import event data</p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
            <p className="text-gray-700 mb-4">Supports .xlsx and .xls files</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              disabled={uploading}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {uploading
                ? uploadStatus === "uploading"
                  ? "Uploading..."
                  : "Processing..."
                : "Select File"}
            </Button>
            {uploading && (
              <div className="mt-4 max-w-md mx-auto text-left">
                <ProgressBar
                  progress={uploadProgress}
                  label={uploadStatus === "uploading" ? "Uploading file" : "Importing and validating rows"}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-6">
            {uploadResult.success ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-medium text-green-700">Import Completed</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{uploadResult.data.totalRows}</p>
                    <p className="text-sm text-gray-700">Total Rows</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{uploadResult.data.successRows}</p>
                    <p className="text-sm text-gray-700">Imported</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{uploadResult.data.failedRows}</p>
                    <p className="text-sm text-gray-700">Failed</p>
                  </div>
                </div>
                {uploadResult.data.sheetResults && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Sheet Results:</h4>
                    {uploadResult.data.sheetResults.map((sheet: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                        <span>{sheet.sheetName}</span>
                        <span className="text-sm">
                          {sheet.successRows} success, {sheet.failedRows} failed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                <p className="text-red-700">{uploadResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Import History</h2>
        </CardHeader>
        {loading ? (
          <LoadingSpinner />
        ) : batches.length === 0 ? (
          <EmptyState title="No imports yet" description="Upload an Excel file to get started" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Status</Th>
                <Th>File Name</Th>
                <Th>Total</Th>
                <Th>Success</Th>
                <Th>Failed</Th>
                <Th>Uploaded By</Th>
                <Th>Date</Th>
              </tr>
            </Thead>
            <Tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50">
                  <Td>{getStatusIcon(batch.status)}</Td>
                  <Td className="font-medium">{batch.fileName}</Td>
                  <Td>{batch.totalRows}</Td>
                  <Td className="text-green-600">{batch.successRows}</Td>
                  <Td className="text-red-600">{batch.failedRows}</Td>
                  <Td>{batch.uploadedBy.name}</Td>
                  <Td>{format(new Date(batch.createdAt), "PPp")}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
