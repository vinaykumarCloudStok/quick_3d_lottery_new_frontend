
import { icon } from '../utility/icon'

const RotateImage = () => {
  return (
    <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#000",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <img
            src={icon.RotateImage}
            alt="Rotate your phone"
            style={{ width: "50%", marginBottom: "1rem" }}
          />

        </div>
  )
}

export default RotateImage