import logo from "../assets/readroom-logo.svg";

export default function SplashScreen() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#FBFAF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <img
                src={logo}
                alt="ReadRoom"
                style={{
                    width: 96,
                    height: 96,
                    animation: "splashPop 0.7s ease-out forwards",
                }}
            />

            <style>
                {`
                    @keyframes splashPop {
                        0% {
                            opacity: 0;
                            transform: scale(0.92);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}
            </style>
        </div>
    );
}