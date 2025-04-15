export default function Layout({ children }) {
    return (
      <div
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
          minHeight: "100vh",
          width: "100vw",
          overflowX: "hidden"
        }}
      >
        {children}
      </div>
    );
  }
  