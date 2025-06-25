import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImpulseItem from './components/ImpulseItem';
import Loading from './components/Loading';
import {
  clearAllImpulses,
  getAllImpulses,
  ImpulseEntry,
  initDatabase,
  insertImpulse,
  updateImpulseComment
} from './database/impulses';
import styles from './styles';
import { formatTimestamp, syncTimeWithGPS, syncTimeWithGPSFallback } from './utils/time';

const IMPULSE_ITEM_HEIGHT = 60;

export default function App() {
  const [entries, setEntries] = useState<ImpulseEntry[]>([]);
  const [syncedTime, setSyncedTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const flatListRef = useRef<FlatList<ImpulseEntry>>(null);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useKeepAwake();

  // Carga los impulsos desde la base de datos
  const loadEntries = useCallback(async (cb?: () => void) => {
    const all = await getAllImpulses();
    setEntries(all);
    if (cb) cb();
  }, []);

  const handleTimeSync = useCallback(async () => {
    setLoading(true);
    try {
      const time = await syncTimeWithGPS();
      setSyncedTime(time);
      const offset = Date.now() - time.getTime();
      setTimeOffset(isNaN(offset) ? 0 : offset);
    } catch {
      const fallbackTime = await syncTimeWithGPSFallback();
      setSyncedTime(fallbackTime);
      const offset = Date.now() - fallbackTime.getTime();
      setTimeOffset(isNaN(offset) ? 0 : offset);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialización y sincronización de hora
  useEffect(() => {
    (async () => {
      await initDatabase();
      await handleTimeSync();
      await loadEntries();
    })();
  }, [handleTimeSync, loadEntries]);

  // Actualiza el reloj sincronizado
  useEffect(() => {
    if (timeOffset === null || timeOffset === undefined) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date(Date.now() - timeOffset));
    }, 100);
    return () => clearInterval(interval);
  }, [timeOffset]);

  // Registrar un nuevo impulso
  const handleImpulse = useCallback(async () => {
    if (!syncedTime) return Alert.alert('Hora no sincronizada');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const timestamp = formatTimestamp(new Date());
    await insertImpulse(timestamp);
    await loadEntries(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [syncedTime, loadEntries]);

  // Cambios en comentarios
  const handleCommentChange = useCallback((id: number, value: string) => {
    setEntries(prev =>
      prev.map(entry => (entry.id === id ? { ...entry, tempComment: value } : entry))
    );
  }, []);

  const handleCommentBlur = useCallback(async (id: number, value: string) => {
    await updateImpulseComment(id, value);
  }, []);

  // Limpiar todos los impulsos
  const handleClear = useCallback(() => {
    Alert.alert('¿Limpiar todo?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await clearAllImpulses();
          await loadEntries();
        },
      },
    ]);
  }, [loadEntries]);

  // Exportar a Excel
  const exportToExcel = useCallback(async () => {
    const rows = await getAllImpulses();

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

    // Convert ArrayBuffer to base64 string
    const uint8Array = new Uint8Array(buffer as ArrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = global.btoa(binary);

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Compartir archivo de Excel',
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding' })}>
        <View style={styles.listContainer}>
          {currentTime && <Text style={styles.clock}>{formatTimestamp(currentTime)}</Text>}
          <Text style={styles.header}>Impulsos registrados</Text>
          <FlatList
            ref={flatListRef}
            data={entries}
            keyExtractor={(item) => `${item.id}`}
            renderItem={({ item, index }) => (
              <ImpulseItem
                item={item}
                index={index}
                total={entries.length}
                onCommentChange={handleCommentChange}
                onBlur={handleCommentBlur}
              />
            )}
            getItemLayout={(_, index) => ({
              length: IMPULSE_ITEM_HEIGHT,
              offset: IMPULSE_ITEM_HEIGHT * index,
              index,
            })}
          />
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.buttonLarge} onPress={handleImpulse}>
            <Text style={styles.buttonTextLarge}>📍 Registrar Impulso</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.buttonHalf, styles.buttonHalfLeft]} onPress={exportToExcel}>
              <Text style={styles.buttonText}>📤 Exportar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonHalf, styles.buttonDanger]} onPress={handleClear}>
              <Text style={styles.buttonText}>🗑️ Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
