import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;

  onClose: () => any;
}

const MoonpayModal = (props: Props) => {
  const [showMoonpay, setShowMoonpay] = useState(false);

  useEffect(() => {
    let timeout: any;

    if (props.isOpen) {
      timeout = setTimeout(() => {
        setShowMoonpay(true);
      }, 150);
    } else {
      clearTimeout(timeout);
      setShowMoonpay(false);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [props.isOpen]);

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        height="650px"
        width={{ md: "450px", base: "92%" }}
        backgroundColor="white"
        borderRadius="10px"
        overflow="hidden"
      >
        {showMoonpay ? (
          <iframe
            title="Moonpay"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
            height="100%"
            src={`https://buy-staging.moonpay.io?colorCode=%2327A17A&apiKey=pk_live_4yhdRyK2JeY6lBhVRQUZ2O8SRjwQ0F88`}
            width="100%"
          >
            <p>Your browser does not support iframes.</p>
          </iframe>
        ) : null}
      </ModalContent>
    </Modal>
  );
};

export default MoonpayModal;
