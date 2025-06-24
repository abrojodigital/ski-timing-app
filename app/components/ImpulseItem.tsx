import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ImpulseEntry } from '../database/impulses';

type Props = {
  item: ImpulseEntry;
  index: number;
  total: number;
  onCommentChange: (id: number, value: string) => void;
  onBlur: (id: number, value: string) => void;
};

export default function ImpulseItem({ item, index, total, onCommentChange, onBlur }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.timestamp}>{total - index}. {item.timestamp}</Text>
      <TextInput
        placeholder="Comentario..."
        style={styles.commentInput}
        value={item.tempComment || ''}
        onChangeText={(text) => onCommentChange(item.id, text)}
        onBlur={() => onBlur(item.id, item.tempComment || '')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 6,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 6,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    fontSize: 14,
  },
});
