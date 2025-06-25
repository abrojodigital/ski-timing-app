import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: { flex: 0.85, padding: 10 },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  bottomContainer: {
    flex: 0.15,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDanger: {
    backgroundColor: '#cc0000',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    // marginTop: 10,
  },
  clock: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: '#444',
  },
  buttonLarge: {
    backgroundColor: '#0066cc',
    paddingVertical: 18, // altura mayor
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonTextLarge: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonHalf: {
    flex: 1,
    height: 60,
    backgroundColor: '#444',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHalfLeft: {
    marginRight: 10, // Separación entre botones
  },
});
