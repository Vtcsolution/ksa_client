"use client";

import { AnimatePresence } from "framer-motion";
import { useUiStore } from "@/store/useUiStore";
import LeadDetailModal from "./LeadDetailModal";
import CallModal from "./CallModal";
import VisitModal from "./VisitModal";
import MeetingModal from "./MeetingModal";
import TransferModal from "./TransferModal";
import QuoteModal from "./QuoteModal";
import FixDataModal from "./FixDataModal";
import ContentModal from "./ContentModal";
import AddFieldModal from "./AddFieldModal";
import AddStaffModal from "./AddStaffModal";
import AddContentModal from "./AddContentModal";
import EditPricingModal from "./EditPricingModal";
import AddExpenseModal from "./AddExpenseModal";
import CallInsightModal from "./CallInsightModal";

export default function ModalRouter() {
  const modal = useUiStore((s) => s.modal);

  return (
    <AnimatePresence>
      {modal?.type === "leadDetail" && <LeadDetailModal key="leadDetail" leadId={modal.leadId} />}
      {modal?.type === "call" && <CallModal key="call" leadId={modal.leadId} />}
      {modal?.type === "visit" && <VisitModal key="visit" leadId={modal.leadId} />}
      {modal?.type === "meeting" && <MeetingModal key="meeting" leadId={modal.leadId} />}
      {modal?.type === "transfer" && <TransferModal key="transfer" leadId={modal.leadId} />}
      {modal?.type === "quote" && <QuoteModal key="quote" leadId={modal.leadId} />}
      {modal?.type === "fixData" && <FixDataModal key="fixData" leadId={modal.leadId} />}
      {modal?.type === "content" && <ContentModal key="content" leadId={modal.leadId} />}
      {modal?.type === "addField" && <AddFieldModal key="addField" />}
      {modal?.type === "addStaff" && <AddStaffModal key="addStaff" />}
      {modal?.type === "addContent" && <AddContentModal key="addContent" />}
      {modal?.type === "editPricing" && <EditPricingModal key="editPricing" />}
      {modal?.type === "addExpense" && <AddExpenseModal key="addExpense" />}
      {modal?.type === "callInsight" && <CallInsightModal key="callInsight" callId={modal.callId} />}
    </AnimatePresence>
  );
}
