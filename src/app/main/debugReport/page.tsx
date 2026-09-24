import { useSearchParams } from "react-router";
import { DataPanel } from "cim-ui-components";
import { proxyURL } from "../../../utils/lib/proxyAPI";
import { ActionReport } from "cim-action-report";

// import { clientLogger } from '../../../clientLogger';

export default function ActionReportPage() {
  const [searchParams] = useSearchParams();

  const actionCode = searchParams!
    .get("query")
    ?.replace(/\?/g, (_match, offset, str) => {
      const firstIndex = str.indexOf("?");
      return offset === firstIndex ? "?" : "&";
    });
  const refId = searchParams.get("refId");
  const layout = searchParams!.get("layout") || "table";

  // clientLogger.info("app.debugReport.ActionReportPage : Rendering Action Report Page");
  return (
    <div>
      <ActionReport
        refId={refId ?? ""}
        proxyURL={proxyURL}
        actionCode={actionCode ?? ""}
      />
      <div className="p-6">
        <DataPanel
          autoPublish={true}
          api={`${proxyURL}/${actionCode}`}
          headerTitle="Output Result"
          shouldRender={true}
          viewLayout={layout}
        />
      </div>
    </div>
  );
}
