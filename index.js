import { AppRegistry } from 'react-native';
import App from './App';  // ← src/App nahi, seedha ./App
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);