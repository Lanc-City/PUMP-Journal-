
import { View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAccentColorStore } from '../hooks/use-accent-color-store';
import { IconSymbol } from '../components/ui/icon-symbol';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card, List, SegmentedButtons } from 'react-native-paper';
import { useSettings } from '@/hooks/use-settings';

// A more vibrant and Material You-aligned color palette
const accentColors = [
    { name: 'Default', color: '#006978' },
    { name: 'Google Blue', color: '#4285F4' },
    { name: 'Google Green', color: '#34A853' },
    { name: 'Google Red', color: '#EA4335' },
    { name: 'Indigo', color: '#3F51B5' },
    { name: 'Orange', color: '#FF9800' },
    { name: 'Pink', color: '#E91E63' },
    { name: 'Teal', color: '#009688' },
    { name: 'Purple', color: '#9C27B0' },
    { name: 'Blue Gray', color: '#607D8B' },
];

export default function AppearanceScreen() {
  const theme = useAppTheme();
  const { accentColor, setAccentColor } = useAccentColorStore();
  const { weightUnit, setUnit } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.card} elevation={2}>
            <List.Subheader>Weight Unit</List.Subheader>
            <Card.Content>
                <SegmentedButtons
                    value={weightUnit}
                    onValueChange={(value) => setUnit(value as 'kg' | 'lb')}
                    buttons={[
                        { value: 'kg', label: 'Kilograms' },
                        { value: 'lb', label: 'Pounds' },
                    ]}
                />
            </Card.Content>
      </Card>
      <Card style={styles.card} elevation={2}>
        <List.Subheader>Accent Color</List.Subheader>
        <Card.Content>
            <FlatList
            data={accentColors}
            numColumns={5} // Arrange colors in a grid
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item }) => (
                <View style={styles.colorButtonWrapper}>
                <TouchableOpacity
                    onPress={() => setAccentColor(item.color)}
                    style={[
                    styles.colorButton,
                    { backgroundColor: item.color },
                    ]}
                >
                    {accentColor.toUpperCase() === item.color.toUpperCase() && (
                    <IconSymbol name="check" color={theme.colors.onPrimary} size={24} />
                    )}
                </TouchableOpacity>
                </View>
            )}
            keyExtractor={(item) => item.name}
            />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 28,
  },
  flatListContent: {
    alignItems: 'center',
  },
  colorButtonWrapper: {
    margin: 4,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
