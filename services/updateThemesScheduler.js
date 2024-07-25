import cron from 'node-cron'
import { updateThemesFromBricksetApi } from '../controllers/brickSetApi.js'

// Schedule the function to run monthly
export const startUpdateThemesScheduler = () => {
    cron.schedule('0 0 1 * *', async () => {
    console.log('Running updateThemesFromBricksetApi...');
    await updateThemesFromBricksetApi();
});
}
