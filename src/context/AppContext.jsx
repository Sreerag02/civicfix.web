import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const backendUrl = "https://vercel.com/sreerag-krishna-ss-projects/civicfix-server/SZhHTU9DnoSqGkznPovZqt3ZGKjg";
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [userData, setUserData] = useState(null);
    const [issues, setIssues] = useState([]);

    const getIssues = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/issue/list`);
            if (data.success) {
                setIssues(data.issues);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getIssues();
    }, []);

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        } else {
            setUserData(null)
        }
    }, [token])

    const value = {
        backendUrl,
        token, setToken,
        userData, setUserData,
        issues, setIssues,
        getIssues,
        loadUserProfileData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
