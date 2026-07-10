import { useNavigate } from 'react-router-dom'
import { EmptyState, PriceTag, formatPrice } from '../../shared/components'
import styles from './CartPage.module.css'
import { getLineKey } from './cartReducer'
import type { CartItem } from './cartReducer'
import { useCart } from './useCart'

type CartLineRowProps = {
  item: CartItem
  onRemove: () => void
}

function CartLineRow({ item, onRemove }: CartLineRowProps) {
  // Display order (storage before color) follows the design reference; it's
  // independent from the data/action field order used elsewhere in the reducer.
  const specs = [item.selectedStorage, item.selectedColor].filter(Boolean).join(' | ')

  return (
    <li className={styles.row}>
      <img className={styles.image} src={item.imageUrl} alt={item.name} />

      <div className={styles.info}>
        <div>
          <p className={styles.name}>{item.name}</p>
          {specs ? <p className={styles.specs}>{specs}</p> : null}
          <p className={styles.unitPrice}>
            {formatPrice(item.price)}
            {item.quantity > 1 ? ` × ${item.quantity}` : null}
          </p>
        </div>

        <button type="button" className={styles.removeButton} onClick={onRemove}>
          Eliminar
        </button>
      </div>
    </li>
  )
}

export function CartPage() {
  const { state, dispatch, itemCount, total } = useCart()
  const navigate = useNavigate()
  const isEmpty = state.items.length === 0

  function handleRemove(item: CartItem) {
    dispatch({
      type: 'cart/remove',
      payload: {
        id: item.id,
        selectedColor: item.selectedColor,
        selectedStorage: item.selectedStorage,
      },
    })
  }

  return (
    <section>
      <h1 className={styles.title}>CART ({itemCount})</h1>

      {isEmpty ? (
        <EmptyState title="Your cart is empty" description="Add a phone to see it here." />
      ) : (
        <ul className={styles.list}>
          {state.items.map((item) => (
            <CartLineRow key={getLineKey(item)} item={item} onRemove={() => handleRemove(item)} />
          ))}
        </ul>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.continueButton} onClick={() => navigate('/')}>
          Continue shopping
        </button>
        {!isEmpty ? (
          <div className={styles.summary}>
            <PriceTag amount={total} prefix="Total" className={styles.total} />
            {/* No checkout endpoint exists yet — keep this purely presentational. */}
            <button type="button" className={styles.payButton} disabled>
              Pay
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
