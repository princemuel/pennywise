import { Route, Routes } from 'react-router-dom';
import { Home, Layout, Missing } from './components';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}
export default App;
