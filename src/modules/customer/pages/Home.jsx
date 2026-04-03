import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchHomePopular,
  fetchHomeTrending,
  fetchHomeVeg,
  fetchHomeQuickBites,
  fetchAiRecommendations,
  selectHomePopular,
  selectHomeTrending,
  selectHomeVeg,
  selectHomeQuickBites,
  selectHomeLoading,
  selectHomeFetched,
  selectRecommendations,
  selectRecommendationsLoading,
  selectRecommendationsFetched,
} from "../../../store/slices/homeDishesSlice";
import { fetchCategories } from "../../../store/slices/categorieSlice";
import HomeSkeleton from "../components/homeComponents/HomeSkeleton";
import SearchBar from "../components/homeComponents/SearchBar"
import RotatingOffersCarousel from "../components/homeComponents/RotatingOffersCarousel";
import PopularCategories from "../components/homeComponents/PopularCategories";
import RecommendedDishes from "../components/homeComponents/RecommendedDishes";
import QuickMenuBanner from "../components/homeComponents/QuickMenuBanner";
import RestaurantHighlights from "../components/homeComponents/RestaurantHighlights";
import FeaturesGrid from "../components/homeComponents/FeaturesGrid";
import MostPopular from "../components/homeComponents/MostPopular";
import QuickBites from "../components/homeComponents/QuickBites";
import ChefsSpecial from "../components/homeComponents/ChefsSpecial";
import VegSpecial from "../components/homeComponents/VegSpecial";

export default function UserHome() {
  const dispatch = useAppDispatch();

  const popular = useAppSelector(selectHomePopular);
  const trending = useAppSelector(selectHomeTrending);
  const veg = useAppSelector(selectHomeVeg);
  const quickBites = useAppSelector(selectHomeQuickBites);
  const dishLoading = useAppSelector(selectHomeLoading);
  const homeFetched = useAppSelector(selectHomeFetched);

  const recommendations = useAppSelector(selectRecommendations);
  const recommendationsLoading = useAppSelector(selectRecommendationsLoading);
  const recommendationsFetched = useAppSelector(selectRecommendationsFetched);

  const { fetched: catFetched, loading: catLoading } = useAppSelector(
    (s) => s.categories,
  );

  const isLoading = dishLoading || catLoading;

  // Fetch all home dishes
  useEffect(() => {
    if (!homeFetched) {
      dispatch(fetchHomePopular());
      dispatch(fetchHomeTrending());
      dispatch(fetchHomeVeg());
      dispatch(fetchHomeQuickBites());
    }
  }, [homeFetched, dispatch]);

  // Fetch AI recommendations separately — doesn't block main page load
  useEffect(() => {
    if (!recommendationsFetched) {
      dispatch(fetchAiRecommendations());
    }
  }, [recommendationsFetched, dispatch]);

  // Fetch categories
  useEffect(() => {
    if (!catFetched) dispatch(fetchCategories());
  }, [catFetched, dispatch]);

  if (isLoading && !homeFetched) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-00 to-gray-200 dark:from-gray-900 dark:to-gray-900 pb-24">
      <div className="pt-28 px-3">
        <SearchBar />
        <RotatingOffersCarousel />
        <PopularCategories />
        <ChefsSpecial popular={popular} />
        <VegSpecial dishes={veg} isLoading={dishLoading} />
        <QuickBites quickBites={quickBites} isLoading={dishLoading}/>
        <MostPopular trending={trending} isLoading={dishLoading}/>

        {/* AI Recommendations — has its own loading state */}
        <RecommendedDishes
          dishes={recommendations}
          isLoading={recommendationsLoading}
        />

        <FeaturesGrid />
        <QuickMenuBanner />
        <RestaurantHighlights />
      </div>
    </div>
  );
}