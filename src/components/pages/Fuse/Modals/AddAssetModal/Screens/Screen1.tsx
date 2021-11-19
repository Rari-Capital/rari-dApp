// Chakra and UI
import { Row } from "utils/chakraUtils";

// Components
import AssetConfig from "../AssetConfig";


const Screen1 = () => {

    return (
      <>
        <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          overflowY="scroll"
          maxHeight="100%"
          height="95%"
          width="100%"
          maxWidth="100%"
          id="SCREEN1COLUMN"
        >
              <AssetConfig />
        </Row>
      </>
    );
  };

export default Screen1