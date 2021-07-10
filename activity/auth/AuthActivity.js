import React from 'react';
import AppLoading from 'expo-app-loading';
import { StyleSheet,LogBox,useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'moment/locale/id';
import AppNavigator from './AppNavigator';
import { AuthProvider } from './AuthProvider';
import loadResources from '@pn/utils/Assets'

LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);

async function loadResourcesAsync() {
	// load all resources such as images, fonts, etc.
	await loadResources();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default function Auth() {
	const [isLoadingComplete, setLoadingComplete] = React.useState(false);

	if (!isLoadingComplete) {
		return (
			<AppLoading
				startAsync={loadResourcesAsync}
				onError={(err)=>handleLoadingError(err,setLoadingComplete)}
				onFinish={() => handleFinishLoading(setLoadingComplete)}
			/>
		);
	}

	return (
        <SafeAreaView style={[styles.container]}>
			<AuthProvider>
				<AppNavigator />
			</AuthProvider>
        </SafeAreaView>
    );
}

function handleLoadingError(error,setLoadingComplete) {
	// In this case, you might want to report the error to your error reporting
	// service, for example Sentry
	console.log(error);
	setLoadingComplete(true);
}

function handleFinishLoading(setLoadingComplete) {
	setLoadingComplete(true);

}