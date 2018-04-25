'use strict';
import google from './google';
export default app => {
    app.use('/api/google/', google);
}