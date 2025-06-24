import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllImpulses } from '../database/impulses';

const exportToExcel = async () => {
  const rows = getAllImpulses();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Impulsos');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Timestamp', key: 'timestamp', width: 20 },
    { header: 'Comentario', key: 'comment', width: 40 },
  ];

  rows.forEach(row => {
    worksheet.addRow({
      id: row.id,
      timestamp: row.timestamp,
      comment: row.comment || '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileUri = FileSystem.documentDirectory + 'impulsos.xlsx';

  await FileSystem.writeAsStringAsync(
    fileUri,
    Buffer.from(buffer).toString('base64'),
    { encoding: FileSystem.EncodingType.Base64 }
  );

  await Sharing.shareAsync(fileUri, {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Compartir archivo de Excel',
  });
};

export default exportToExcel;