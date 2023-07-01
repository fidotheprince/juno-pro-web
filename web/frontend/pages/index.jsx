import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import { QRCodeIndex } from "../components";
import { useAppQuery } from "../hooks";
import {
  LegacyCard,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";

export default function HomePage() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

/* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
const {
    data: QRCodes,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/qrcodes",
  });


  /* Set the QR codes to use in the list */
  //shows QR codes if there are any
  //passes QRCodes as a prop to the QRCodeIndex component
  ``
  const qrCodesMarkup = QRCodes?.length ? (
    <QRCodeIndex QRCodes={QRCodes} loading={isRefetching} />
  ) : null;

  /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isLoading ? (
    <LegacyCard sectioned>
      <Loading />
      <SkeletonBodyText />
    </LegacyCard>
  ) : null;

  const secondaryActions = [{content: 'Check customer points', url: '/customerpoints', loading: false}];

  /* Use Polaris Card and EmptyState components to define the contents of the empty state */
  //if isLoading is false and there are now QRCodes, then show the empty state
  //else, show nothing
  const emptyStateMarkup =
    !isLoading && !QRCodes?.length ? (
      <LegacyCard sectioned>
        <EmptyState
          heading="Create unique QR codes for your product"
          /* This button will take the user to a Create a QR code page */
          action={{
            content: "Create QR code",
            onAction: () => navigate("/qrcodes/new"),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>
            Allow customers to scan codes and buy products using their phones.
          </p>
        </EmptyState>
      </LegacyCard>
    ) : null;

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */
  return (
    //!! is a shorthand that means "convert the value to a boolean"
    //if the value is truthy, it will be true and if it is falsy, it will be false
    <Page fullWidth={!!qrCodesMarkup}>
      <TitleBar
        title="QR codes"
        primaryAction={{
          content: "Create QR code",
          onAction: () => navigate("/qrcodes/new"),
        }}
        secondaryActions={secondaryActions}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {qrCodesMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

