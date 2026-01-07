
/**
 * TITAN ENGINE: AUCTION SYSTEM
 * Global marketplace with inflation control (Gold Sink).
 */

export interface AuctionItem {
  id: string;
  itemId: string; // Ref to Item DB
  itemData: any;  // JSON blob of item stats
  sellerId: string;
  price: number; // Current bid or Buyout
  isBuyout: boolean;
  expiresAt: number;
  highestBidderId?: string;
}

export class AuctionSystem {
  private auctions: Map<string, AuctionItem> = new Map();
  private taxRate: number = 0.05; // 5% Tax

  constructor() {}

  /**
   * Lists an item. Removes it from seller inventory immediately (Escrow).
   */
  public createListing(sellerId: string, item: any, price: number, durationHours: number): string {
    const id = `auc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const auction: AuctionItem = {
      id,
      itemId: item.id,
      itemData: item,
      sellerId,
      price,
      isBuyout: true, // Simplified: Fixed price for now
      expiresAt: Date.now() + (durationHours * 60 * 60 * 1000)
    };

    this.auctions.set(id, auction);
    console.log(`[Economy] New Listing: ${item.name} for ${price}g by ${sellerId}`);
    
    // In real implementation: DB.removePlayerItem(sellerId, item.id);
    return id;
  }

  /**
   * Processes a purchase. Transfers gold and item.
   */
  public buyItem(buyerId: string, auctionId: string, buyerGold: number): { success: boolean; error?: string } {
    const auction = this.auctions.get(auctionId);
    
    if (!auction) return { success: false, error: "Auction not found or expired." };
    if (auction.sellerId === buyerId) return { success: false, error: "Cannot buy your own item." };
    if (buyerGold < auction.price) return { success: false, error: "Insufficient funds." };

    // 1. Calculate Tax
    const taxAmount = Math.floor(auction.price * this.taxRate);
    const payout = auction.price - taxAmount;

    // 2. Transfer Gold
    // DB.removeGold(buyerId, auction.price);
    // DB.addGold(auction.sellerId, payout);
    
    // 3. Transfer Item
    // DB.addPlayerItem(buyerId, auction.itemData);

    // 4. Cleanup
    this.auctions.delete(auctionId);

    console.log(`[Economy] Sold: ${auction.id}. Tax Burned: ${taxAmount}g`);
    return { success: true };
  }

  /**
   * Periodic cleanup of expired auctions.
   */
  public update() {
    const now = Date.now();
    this.auctions.forEach((auc, id) => {
      if (now > auc.expiresAt) {
        // Return item to seller
        // DB.addPlayerItem(auc.sellerId, auc.itemData);
        // DB.sendMail(auc.sellerId, "Auction Expired", "Your item was returned.");
        this.auctions.delete(id);
      }
    });
  }

  public getListings(page: number, filter?: string): AuctionItem[] {
    // Mock pagination
    return Array.from(this.auctions.values()).slice(0, 50);
  }
}
