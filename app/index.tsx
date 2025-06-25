import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
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

const IMPULSE_ITEM_HEIGHT = 60; // Altura en píxeles (ajusta según diseño)

export default function App() {
  const [entries, setEntries] = useState<ImpulseEntry[]>([]);
  const [syncedTime, setSyncedTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const flatListRef = useRef<FlatList<ImpulseEntry>>(null);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useKeepAwake(); // Mantiene la pantalla despierta mientras la app está activa

  useEffect(() => {
    initDatabase();
    handleTimeSync();
    loadEntries();
  }, []);


  const handleTimeSync = async () => {
    try {
      setLoading(true);
      const time = await syncTimeWithGPS();
      setSyncedTime(time);
      const offset = Date.now() - time.getTime();
      console.log('Offset calculado:', offset);
      if (isNaN(offset)) {
        throw new Error('Offset es NaN');
      }
      setTimeOffset(offset);
    } catch (e) {
      console.error(e);
      const fallbackTime = await syncTimeWithGPSFallback();
      setSyncedTime(fallbackTime);
      const offset = Date.now() - fallbackTime.getTime();
      console.log('Offset fallback:', offset);
      if (isNaN(offset)) {
        throw new Error('Offset fallback es NaN');
      }
      setTimeOffset(offset);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeOffset === null || timeOffset === undefined) return;
    const interval = setInterval(() => {
      // Hora sincronizada = hora local - offset
      setCurrentTime(new Date(Date.now() - timeOffset));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeOffset]);

  const handleImpulse = () => {
    if (!syncedTime) return Alert.alert('Hora no sincronizada');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const timestamp = formatTimestamp(new Date());
    insertImpulse(timestamp);
    loadEntries(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  const loadEntries = (cb?: () => void) => {
    const data = getAllImpulses();
    setEntries(data.map(e => ({ ...e, tempComment: e.comment || '' })));
    cb?.();
  };

  const handleCommentChange = (id: number, value: string) => {
    setEntries(prev =>
      prev.map(entry => (entry.id === id ? { ...entry, tempComment: value } : entry))
    );
  };

  const handleCommentBlur = (id: number, value: string) => {
    updateImpulseComment(id, value);
  };

  const handleClear = () => {
    Alert.alert('¿Limpiar todo?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          clearAllImpulses();
          loadEntries();
        },
      },
    ]);
  };

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
  };

  if (loading) {
    return <Loading />;
  } else {
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
              getItemLayout={(data, index) => ({
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
}
