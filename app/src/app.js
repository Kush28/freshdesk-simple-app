var client;

async function init() {
  client = await app.initialized();
  client.events.on("app.activated", renderApp);
}

async function getData(domainName) {
  const options = {
    headers: {
      Authorization: "Basic <%= encode(iparam.api_key) %>",
      "Content-Type": "application/json",
    },
  };
  const STATUS_CODES = [2, 3, 4, 5];
  const responses = await Promise.all(
    STATUS_CODES.map(function (status) {
      const url = `https://${domainName}/api/v2/search/tickets?query="status:${status}"`;
      return client.request.get(url, options);
    })
  );
  const data = responses.map((r) => JSON.parse(r.response));
  return data;
}

async function renderApp() {
  ReactDOM.render(<App>This is my app</App>, document.getElementById("root"));
}

function App() {
  const [domainName, setDomainName] = React.useState("");
  const [ticketsData, setTicketsData] = React.useState([]);
  React.useEffect(() => {
    client.data.get("domainName").then(function ({ domainName }) {
      setDomainName(domainName);
    });
  }, []);

  React.useEffect(() => {
    async function fetchData(domainName) {
      const res = await getData(domainName);
      setTicketsData(res);
      console.log("All tickets: ", res);
    }
    if (domainName) {
      fetchData(domainName);
    }
  }, [domainName]);
  return (
    <main className="container-fluid">
      <div className="page-header">
        <h4>Domain name: {domainName}</h4>
      </div>
      <div className="jumbotron">
        <h4>Ticket status:</h4>
        <div className="fw-divider"></div>
        <div className="fw-content-list">
          <div className="muted">Open</div>
          <div>Count: {ticketsData[0] && ticketsData[0].total}</div>
        </div>
        <div className="fw-divider"></div>
        <div className="fw-content-list">
          <div className="muted">Pending</div>
          <div>Count: {ticketsData[1] && ticketsData[1].total}</div>
        </div>
        <div className="fw-divider"></div>
        <div className="fw-content-list">
          <div className="muted">Resolved</div>
          <div>Count: {ticketsData[2] && ticketsData[2].total}</div>
        </div>
        <div className="fw-divider"></div>
        <div className="fw-content-list">
          <div className="muted">Closed</div>
          <div>Count: {ticketsData[3] && ticketsData[3].total}</div>
        </div>
      </div>
    </main>
  );
}

init();
