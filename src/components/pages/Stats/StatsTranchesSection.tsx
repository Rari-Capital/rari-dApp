import React from 'react'
import { motion } from 'framer-motion'
import {
    Heading,
} from '@chakra-ui/react';

export default () => {
    return (
        <motion.div
            key="tranches"
            style={{ width: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Heading>
                Tranches Section baby
            </Heading>
        </motion.div>
    )
}

