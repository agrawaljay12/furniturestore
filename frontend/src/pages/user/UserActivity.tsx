import { useState, useEffect } from "react";

const useActivityLogger = () => {
    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const storedUserId = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("email");

        if (storedUserId && storedUsername) {
            setUserId(storedUserId);
            setUsername(storedUsername);
        } else {
            console.error("User not logged in.");
        }
    }, []);

    const logUserActivity = async (activity: string) => {
        if (!userId || !username || !activity) {
            // alert("Please select an activity.");
            return;
        }

        const activityData = {
            user_id: userId,
            username: username,
            activity: activity
        };

        try {
            const response = await fetch("http://localhost:10007/api/v1/useractivity/activities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(activityData)
            });

            if (response.ok) {
                console.log("User activity logged successfully!");                
                // alert("Activity logged successfully!");
            } else {
                const result = await response.json();
                alert(`Failed to log activity: ${result.message}`);
            }
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    return logUserActivity;
};

export default useActivityLogger;