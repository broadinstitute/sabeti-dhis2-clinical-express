import fetch from 'isomorphic-fetch';

const ClientApi = {
  get: {
    async asyncGetProgram() {
      const response = await fetch(`http://localhost:3000/api/dhis`);
      const data = await response.json();
      return data;
    },
    async asyncGetDisplayValues(uniqueIDs) {
      const response = await fetch(`http://localhost:3000/api/dataElements/${uniqueIDs}`);
      const data = await response.json();
      return data;
    }
  }
};


export default ClientApi;