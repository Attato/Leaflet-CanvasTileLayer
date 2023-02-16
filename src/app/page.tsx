import type { NextPage } from 'next';
import Map from 'components/map/dynamicMap';
import styles from './page.module.scss';

const Home: NextPage = () => {
	return (
		<main className={styles.main}>
			<Map />
		</main>
	);
};

export default Home;
