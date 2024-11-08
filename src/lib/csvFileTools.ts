import { stringify } from "csv-stringify/browser/esm";
import type { Bank, CSVBody, CSVRow } from "../types";
import { getKbData } from "./getKbData";
import { getAirBankData } from "./getAirBankData";

function getCsvString(csvData: CSVBody): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(
      csvData,
      {
        delimiter: ";",
        quoted: true,
      },
      (err, output) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(output);
      },
    );
  });
}

function getCsvData(fileContent: string, bankId: string) {
  try {
    switch (bankId) {
      case "kb":
        return getKbData(fileContent);
      case "air_bank":
        return getAirBankData(fileContent);
      default:
        throw new Error("Invalid bank ID");
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * We need to use the older FileReader API because of cp1250 encoding
 */
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        const result = reader.result as string;
        resolve(result);
      },
      false,
    );

    if (file) {
      reader.readAsText(file, "cp1250");
    } else {
      reject("No file specified");
    }
  });
}

export async function getDownloadLink(csvData: CSVBody) {
  const csvString = await getCsvString(csvData);
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
  return URL.createObjectURL(blob);
}

export async function getYnabCsv(
  item: DataTransferItem,
  bank: Bank,
): Promise<CSVBody> {
  if (item.kind !== "file" || item.type !== "text/csv") {
    throw new Error("Invalid file type");
  }

  const file = <File>item.getAsFile();
  let fileContent = await readTextFile(file);

  if (bank.preprocessFunction) {
    fileContent = bank.preprocessFunction(fileContent);
  }

  const csvData = await getCsvData(fileContent, bank.id);

  if (!csvData) {
    throw new Error("Invalid CSV data");
  }

  const headerRow = ["Date", "Payee", "Memo", "Amount"];
  return [headerRow, ...csvData];
}
