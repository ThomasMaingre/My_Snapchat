import React, { useContext } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import AuthContext from '../Contexts/AuthContext';
import appStyles from "../Style/app";
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
    const { setToken } = useContext(AuthContext);
    const navigation = useNavigation();

    const handleLogout = () => {
        setToken('');
        navigation.navigate('Login');
        console.log('Déconnecté');
    };

    return (
        <SafeAreaView>
            <View>
                <TouchableOpacity style={[appStyles.button, appStyles.logoutButton]} onPress={handleLogout}>
                    <Text style={[appStyles.buttonText, appStyles.center]}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Profile;
