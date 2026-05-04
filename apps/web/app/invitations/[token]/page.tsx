import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getInvitationByToken } from "@trueprice-ai/db";
import Link from "next/link";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { AcceptButton } from "./AcceptButton";

export default async function InvitationPage({ params }: { params: { token: string } }) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect(`/sign-up?redirect_url=/invitations/${params.token}`);
  }

  const invite = await getInvitationByToken(params.token);

  if (!invite) {
    return <ErrorPage message="Cette invitation n'existe pas." />;
  }

  if (invite.acceptedAt) {
    return <ErrorPage message="Cette invitation a déjà été utilisée." />;
  }

  if (invite.expiresAt < new Date()) {
    return <ErrorPage message="Cette invitation a expiré. Demandez un nouveau lien à l'administrateur." />;
  }

  const roleLabel = { ADMIN: "Administrateur", MANAGER: "Manager", MEMBER: "Membre" }[invite.role];

  return (
    <div className="min-h-screen bg-tp-navy-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-tp-navy-card border border-tp-cyan-500/20 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center mx-auto mb-5">
          <Building2 size={24} className="text-tp-cyan-500" strokeWidth={1.75} />
        </div>

        <h1 className="font-display text-2xl font-bold text-white mb-2">Invitation reçue</h1>
        <p className="text-slate-400 text-sm mb-6">
          Vous avez été invité à rejoindre{" "}
          <span className="text-white font-semibold">{invite.organization.name}</span>{" "}
          en tant que <span className="text-tp-cyan-500">{roleLabel}</span>.
        </p>

        <AcceptButton token={params.token} orgId={invite.organizationId} />

        <p className="text-xs text-slate-600 mt-4">
          Expire le {new Date(invite.expiresAt).toLocaleDateString("fr-CA")}
        </p>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-tp-navy-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-tp-navy-card border border-rose-500/20 rounded-2xl p-8 text-center">
        <XCircle size={40} className="text-rose-400 mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-xl font-bold text-white mb-2">Invitation invalide</h1>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <Link href="/dashboard" className="text-tp-cyan-500 text-sm hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
