import { useRef } from 'react'
import { deletePendingTransactions } from '~/database/localStorage'
import Modal from '@/ui/Modal'

export default function TransactionOptions () {
  const confirmClearPendingTrxDialogRef = useRef(null)

  // Clear Transactions
  return <section>
    <h2>Transactions</h2>
    <h3>Pending Transactions</h3>
    <button
      className="danger"
      onClick={() => confirmClearPendingTrxDialogRef.current.open()}
    >
        Clear Pending Transactions
    </button>
    <ConfirmClearPendingTrxDialog />
  </section>

  function ConfirmClearPendingTrxDialog () {
    function confirmClearPendingTrx () {
      deletePendingTransactions()
      confirmClearPendingTrxDialogRef.current.close()
    }
    return <Modal modalId="clear-pending-trx-confirmation" modalRef={confirmClearPendingTrxDialogRef}>
      <form method="dialog">
        <p>Are you sure you want to clear all pending transactions? You may reupload them to make them pending again.</p>
        <div className="flex gap-s">
          <button onClick={() => confirmClearPendingTrx()}>OK</button>
          <button value="cancel" onClick={() => confirmDeleteAccountDialogRef.current.close()}>Cancel</button>
        </div>
      </form>
    </Modal>
  }
}
