
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import styles from '../styles';

export default function Loading() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Sincronizando reloj...</Text>
        </View>
    );
}
