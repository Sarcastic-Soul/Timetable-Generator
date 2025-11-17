import React, { useState, useEffect, useMemo } from "react";
import {
  UploadCloud,
  Clock,
  Server,
  Calendar,
  AlertCircle,
  CheckCircle,
  Users,
  Briefcase,
  Database,
  Download,
} from "lucide-react";

const getFriendlyName = (name) => {
  if (name.startsWith("TT-Sem-")) {
    const parts = name.replace("TT-Sem-", "").split("_");
    if (parts.length >= 2) {
      const sem = parts[0].replace("sem", "Sem ");
      const branch = parts[1].toUpperCase();
      return `${sem} - ${branch}`;
    }
    return name.replace("TT-Sem-", "");
  }
  if (name.startsWith("TT-Inst-")) {
    return name.replace("TT-Inst-", "");
  }
  if (name.startsWith("TT-Lab-")) {
    return name.replace("TT-Lab-", "");
  }
  return name;
};

const Header = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Calendar className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Timetable Generator
          </h1>
          <p className="text-sm text-gray-500">
            University Schedule Management System
          </p>
        </div>
      </div>
    </div>
  </header>
);

const ServerStatusBanner = ({ serverStatus }) => {
  if (serverStatus === "online") return null;

  const isOffline = serverStatus === "offline";

  return (
    <div className="mb-6">
      <div
        className={`p-4 rounded-xl border ${isOffline ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 ${isOffline ? "text-red-500" : "text-yellow-500"}`}
          >
            {isOffline ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3
              className={`font-semibold ${isOffline ? "text-red-900" : "text-yellow-900"}`}
            >
              {isOffline ? "Backend Server Offline" : "Connecting to Server..."}
            </h3>
            <p
              className={`text-sm mt-1 ${isOffline ? "text-red-700" : "text-yellow-700"}`}
            >
              {isOffline
                ? "Could not connect to the Python backend. Please start the server."
                : "Checking connection..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileUpload = ({ selectedFile, handleFileChange, error }) => (
  <div className="space-y-4">
    <label
      htmlFor="file-upload"
      className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        selectedFile
          ? "border-green-500 bg-green-50 hover:bg-green-100"
          : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
      }`}
    >
      {selectedFile ? (
        <div className="text-center px-6">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <p className="font-semibold text-green-900 text-lg mb-1">
            {selectedFile.name}
          </p>
          <p className="text-sm text-green-700">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
          <span className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white">
            Ready to Generate
          </span>
        </div>
      ) : (
        <div className="text-center px-6">
          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="h-8 w-8 text-gray-500" />
          </div>
          <p className="font-medium text-gray-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500">Excel file (.xlsx only)</p>
        </div>
      )}
      <input
        id="file-upload"
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".xlsx"
        onChange={handleFileChange}
      />
    </label>
    {error && (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )}
  </div>
);

const GenerateButton = ({ isLoading, handleGenerateClick, isDisabled }) => (
  <button
    onClick={handleGenerateClick}
    disabled={isDisabled}
    className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl shadow-lg transition-all ${
      isDisabled
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl"
    }`}
  >
    {isLoading ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Processing...
      </>
    ) : (
      <>
        <Server className="-ml-1 mr-2 h-5 w-5" />
        Generate Timetable
      </>
    )}
  </button>
);

const UploadSection = ({
  selectedFile,
  isLoading,
  error,
  serverStatus,
  handleFileChange,
  handleGenerateClick,
}) => (
  <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
    <div className="p-8">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Upload Input File
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Upload your Excel (.xlsx) file containing semester, course, and
            professor data.
          </p>
          <FileUpload
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            error={error}
          />
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Generate Timetable
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Process your file using the CSP solver to create optimized
            schedules.
          </p>
          <GenerateButton
            isLoading={isLoading}
            handleGenerateClick={handleGenerateClick}
            isDisabled={!selectedFile || isLoading || serverStatus !== "online"}
          />
        </div>
      </div>
    </div>
  </div>
);

const TimetableGrid = ({ gridData, onDownload }) => {
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const days = Object.keys(gridData)
    .filter((key) => key !== "Day")
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  const times = gridData["Day"];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-300 sticky left-0 z-10 min-w-[8rem]">
                Day
              </th>
              {times.map((time) => (
                <th
                  key={time}
                  className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-300 min-w-[8rem]"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="px-4 py-4 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-300 sticky left-0 z-10 min-w-[8rem] h-20">
                  {day}
                </td>
                {gridData[day].map((cell, index) => {
                  const cellStr = String(cell || "").trim();
                  const isLunch = cellStr.toLowerCase() === "lunch";
                  const isEmpty = cellStr === "" || cellStr === "0";
                  let bgColor = "bg-white";
                  let textColor = "text-gray-400";
                  let borderColor = "border-gray-300";

                  if (isLunch) {
                    bgColor = "bg-gray-100";
                    textColor = "text-gray-600";
                  } else if (!isEmpty) {
                    if (cellStr.includes("-LAB")) {
                      bgColor = "bg-emerald-50";
                      textColor = "text-emerald-900";
                      borderColor = "border-emerald-200";
                    } else if (cellStr.includes("-LEC")) {
                      bgColor = "bg-blue-50";
                      textColor = "text-blue-900";
                      borderColor = "border-blue-200";
                    } else {
                      bgColor = "bg-indigo-50";
                      textColor = "text-indigo-900";
                      borderColor = "border-indigo-200";
                    }
                  }

                  return (
                    <td
                      key={index}
                      className={`px-4 py-4 text-xs text-center border ${borderColor} ${textColor} ${bgColor} min-w-[8rem] h-20`}
                    >
                      <div className="font-medium leading-tight break-words">
                        {isEmpty ? "-" : cellStr}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TabNavigation = ({ categorizedTimetables, activeTab, setActiveTab }) => {
  const tabs = [
    { name: "SEM", label: "Students", icon: Users },
    { name: "INSTRUCTOR", label: "Instructors", icon: Briefcase },
    { name: "LAB", label: "Lab Rooms", icon: Database },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-2">
      <nav className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          const count = categorizedTimetables[tab.name].length;
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const ResultsSection = ({
  timetableData,
  categorizedTimetables,
  activeTab,
  setActiveTab,
}) => {
  if (!timetableData) return null;

  const activeTimetables = categorizedTimetables[activeTab];

  const downloadCSV = (tableName, gridData) => {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const days = Object.keys(gridData)
      .filter((key) => key !== "Day")
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    const times = gridData["Day"];

    // Create CSV content
    let csv = "Day," + times.join(",") + "\n";

    days.forEach((day) => {
      const row = [
        day,
        ...gridData[day].map((cell) => {
          const cellStr = String(cell || "").trim();
          const isEmpty = cellStr === "" || cellStr === "0";
          // Wrap in quotes if contains comma
          const value = isEmpty ? "-" : cellStr;
          return value.includes(",") ? `"${value}"` : value;
        }),
      ];
      csv += row.join(",") + "\n";
    });

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${tableName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllCSVs = () => {
    activeTimetables.forEach((tableName) => {
      setTimeout(() => {
        downloadCSV(tableName, timetableData[tableName]);
      }, 100);
    });
  };

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Generated Timetables
          </h2>
          <p className="text-gray-600">
            View and manage schedules for students, instructors, and lab rooms
          </p>
        </div>
        {activeTimetables.length > 0 && (
          <button
            onClick={downloadAllCSVs}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            Download All ({activeTimetables.length})
          </button>
        )}
      </div>

      <TabNavigation
        categorizedTimetables={categorizedTimetables}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="mt-6 space-y-6">
        {activeTimetables.length > 0 ? (
          activeTimetables.map((tableName) => (
            <div
              key={tableName}
              className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  {getFriendlyName(tableName)}
                </h3>
              </div>
              <div className="p-6">
                <TimetableGrid
                  gridData={timetableData[tableName]}
                  onDownload={() =>
                    downloadCSV(tableName, timetableData[tableName])
                  }
                />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Timetables Found
            </h3>
            <p className="text-gray-500">
              There are no generated timetables for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");
  const [activeTab, setActiveTab] = useState("SEM");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then(() => setServerStatus("online"))
      .catch(() => setServerStatus("offline"));
  }, []);

  const categorizedTimetables = useMemo(() => {
    if (!timetableData) return { SEM: [], INSTRUCTOR: [], LAB: [] };
    const allKeys = Object.keys(timetableData);
    return {
      SEM: allKeys.filter((key) => key.startsWith("TT-Sem-")),
      INSTRUCTOR: allKeys.filter((key) => key.startsWith("TT-Inst-")),
      LAB: allKeys.filter((key) => key.startsWith("TT-Lab-")),
    };
  }, [timetableData]);

  const handleFileChange = (event) => {
    setTimetableData(null);
    setError(null);
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".xlsx")) {
        setSelectedFile(file);
      } else {
        setError("Invalid file type. Please upload an .xlsx Excel file.");
        setSelectedFile(null);
      }
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setTimetableData(null);
    setError(null);
    setActiveTab("SEM");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-timetable", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown server error occurred.");
      }

      setTimetableData(data);
    } catch (err) {
      let errorMessage = err.message;
      if (err.message.includes("Failed to fetch")) {
        errorMessage =
          "Could not connect to the backend server. Is it running?";
        setServerStatus("offline");
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto py-8 px-6">
        <ServerStatusBanner serverStatus={serverStatus} />
        <UploadSection
          selectedFile={selectedFile}
          isLoading={isLoading}
          error={error}
          serverStatus={serverStatus}
          handleFileChange={handleFileChange}
          handleGenerateClick={handleGenerateClick}
        />
        <ResultsSection
          timetableData={timetableData}
          categorizedTimetables={categorizedTimetables}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </main>
    </div>
  );
}
