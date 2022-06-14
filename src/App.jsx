import { useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCySST-OZJ_rwg-X2Gi19jpu_k5F2xQ9KU",
  authDomain: "fir-test-6d5eb.firebaseapp.com",
  databaseURL: "https://fir-test-6d5eb-default-rtdb.firebaseio.com",
  projectId: "fir-test-6d5eb",
  storageBucket: "fir-test-6d5eb.appspot.com",
  messagingSenderId: "954381057150",
  appId: "1:954381057150:web:9b7c0906723661af90ec2f"
};

const app = initializeApp(firebaseConfig),
  auth = getAuth(app);

connectAuthEmulator(auth, "http://localhost:9099");

const ProtectedRoute = (props) => {

  const location = useLocation();

  if (auth.currentUser) {
    return(props.children);
  } else {
    return(<Navigate to={`/login?next=${location.pathname}`} />)
  }

}

const Index = (props) => {
  return(
    <h2>Home</h2>
  )
}

const Login = (props) => {
  
  const [ form, setForm ] = useState({ emailAddress : '', password : '' }),
    params = useParams(),
    navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, form.emailAddress, form.password)
      .then((userCredential) => {
        props.setCurrentUser(userCredential);
        if (params.next) {
          navigate(params.next, { replace : true });
        } else {
          navigate('/user', { replace : true });
        }
      })
      .catch((error) => {
        const errorCode = error.code,
          errorMessage = error.message;
          console.log('Error: ' + errorCode);
      })
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name] : value });
  }

  return(
    <>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="emailAddress" style={{ display : 'block' }}>Email Address</label>
          <input type="text" name="emailAddress" placeholder="Email Address" onChange={handleChange} value={form.emailAddress} />
        </div>
        <div>
          <label htmlFor="password" style={{ display : 'block' }}>Password</label>
          <input type="password" name="password" placeholder="Password" onChange={handleChange} value={form.password} />
        </div>
        <button type="submit">Log in</button>
      </form>
    </>
  )
}

const Register = (props) => {
  
  const [ form, setForm ] = useState({ emailAddress : '', password : '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    createUserWithEmailAndPassword(auth, form.emailAddress, form.password)
      .then((userCredential) => {
        Navigate('/user', { replace : true });
      })
      .catch((error) => {
        const errorCode = error.code,
          errorMessage = error.message;
        alert(errorCode + ' ' + errorMessage);
      })
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name] : value });
  }

  return(
    <>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="emailAddress" style={{ display : 'block' }}>Email Address</label>
          <input type="text" name="emailAddress" placeholder="Email Address" onChange={handleChange} value={form.emailAddress} />
        </div>
        <div>
          <label htmlFor="password" style={{ display : 'block' }}>Password</label>
          <input type="password" name="password" placeholder="Password" onChange={handleChange} value={form.password} />
        </div>
        <button type="submit">Register</button>
      </form>
    </>
  )

}

const Logout = (props) => {

  props.setCurrentUser(false);
  signOut(auth);
  return(<Navigate to="/" />);

}

const PublicPage = (props) => {
  return(
    <>
      <h2>Public Page</h2>
      <p>This route is public, no authentication required.</p>
    </>
  );
}

const ProtectedPage = (props) => {
  return(
    <>
      <h2>Protected Page</h2>
      <p>This route is protected, you must be authenticated to access</p>
    </>
  )
}

const UserInfo = (props) => {
  
  const user = auth.currentUser;
  let tokenResult = false;

  // const idTokenResult = auth.currentUser.getIdTokenResult();

  user.getIdTokenResult()
    .then((result) => {
      tokenResult = result;
    });
 
    return(
      <>
        <h2>User Info</h2>
        <pre>{JSON.stringify(auth.currentUser)}</pre>
        <pre>{(!tokenResult) ? 'Loading...' : tokenResult}</pre>
      </>
    )
  
}

function App() {

  const [ currentUser, setCurrentUser ] = useState(false);

  return (
    <>
      <h1>Auth Test</h1>
      <ul>
        <li><Link to="/public">Public page</Link></li>
        <li><Link to="/protected">Protected page</Link></li>
        <li><Link to="/user">User Info</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li>{(!currentUser) ? <Link to="/login">Login</Link> : <Link to="/logout">Logout</Link> }</li>
      </ul>
      <Routes>
        <Route index element={<Index />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<ProtectedRoute><UserInfo /></ProtectedRoute>} />
        <Route path="/public" element={<PublicPage />} />
        <Route path="/protected" element={<ProtectedRoute><ProtectedPage /></ProtectedRoute>} />
        <Route path="/logout" element={<Logout setCurrentUser={setCurrentUser} />} />
      </Routes>
    </>
  );
}

export default App;
