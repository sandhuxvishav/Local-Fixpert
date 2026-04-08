import CustomerPortal from "../pages/CustomerPortal.jsx";
import ExpertPortal from "../pages/ExpertPortal.jsx";

import { useData } from "../Context/DataContext";

const Home = () => {
    const { user, setUser } = useData();
    if(!user) return <CustomerPortal/>;
    if (user.isExpert) {
      return <ExpertPortal />;
    } else {
      return <CustomerPortal />;
    }
  };
  
  export default Home;  
