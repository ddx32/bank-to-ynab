export type Bank = {
  name: string;
  id: string;
  color: string;
  secondaryColor: string;
  bodyColor: string;
  icon: string;
  preprocessFunction?: (csvString: string) => string;
};

export type CSVRow = Array<String>;
export type CSVBody = Array<CSVRow>;
