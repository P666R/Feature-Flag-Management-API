import mongoose from 'mongoose';

// * MongoDB connector factory
const createMongoConnector = ({ logger, mongoUri }) => {
  const connect = async (options = {}) => {
    try {
      await mongoose.connect(mongoUri, {
        ...options,
      });
      logger.info('Mongoose connected to MongoDB');
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  };

  // * Connection event listeners
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connection established');
  });
  mongoose.connection.on('error', (error) => {
    logger.error('Mongoose connection error', error);
  });
  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose disconnected from MongoDB');
  });

  const disconnect = async () => {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed');
  };

  return { connect, disconnect };
};

export default createMongoConnector;
