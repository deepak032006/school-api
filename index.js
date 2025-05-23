const express = require('express');
const bodyParser = require('body-parser');
const schoolRoutes = require('./routes/schoolRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/', schoolRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
